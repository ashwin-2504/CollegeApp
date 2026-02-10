import { LectureSlot, TimetableRecord } from '../../modules/timetable/types';
import { getDatabase } from '../sqlite';

type TimetableMetadataRow = {
  semester_locked: number;
  class_name: string | null;
  division: string | null;
  batch: string | null;
  setup_timestamp: string | null;
  locked_at: string | null;
};

type LectureSlotRow = {
  day_of_week: LectureSlot['dayOfWeek'];
  start_time: string;
  end_time: string;
  subject_code: string;
  subject_name: string;
  faculty: string;
  location: string;
  type: LectureSlot['type'];
  batch: string | null;
};

function mapLectureSlot(row: LectureSlotRow): LectureSlot {
  return {
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
    subjectCode: row.subject_code,
    subjectName: row.subject_name,
    faculty: row.faculty,
    location: row.location,
    type: row.type,
    batch: row.batch ?? undefined,
  };
}

export async function getTimetableRecord(): Promise<TimetableRecord | null> {
  const db = await getDatabase();
  const metadata = await db.getFirstAsync<TimetableMetadataRow>(`
    SELECT semester_locked, class_name, division, batch, setup_timestamp, locked_at
    FROM timetable_metadata
    WHERE id = 1
  `);

  if (!metadata || metadata.semester_locked !== 1 || !metadata.class_name || !metadata.division) {
    return null;
  }

  const slots = await listLectureSlots();

  return {
    lockedAt: metadata.locked_at ?? metadata.setup_timestamp ?? new Date(0).toISOString(),
    selection: {
      className: metadata.class_name,
      division: metadata.division,
      batch: metadata.batch ?? undefined,
    },
    slots,
  };
}

export async function saveLockedTimetable(record: TimetableRecord): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('BEGIN;');
  try {
    await db.runAsync(
      `UPDATE timetable_metadata
       SET semester_locked = 1,
           class_name = ?,
           division = ?,
           batch = ?,
           setup_timestamp = COALESCE(setup_timestamp, ?),
           locked_at = ?
       WHERE id = 1`,
      record.selection.className,
      record.selection.division,
      record.selection.batch ?? null,
      record.lockedAt,
      record.lockedAt,
    );

    await db.runAsync('DELETE FROM lecture_slots WHERE timetable_id = 1');

    for (const [index, slot] of record.slots.entries()) {
      await db.runAsync(
        `INSERT INTO lecture_slots (
          timetable_id,
          day_of_week,
          start_time,
          end_time,
          subject_code,
          subject_name,
          faculty,
          location,
          type,
          batch,
          sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        1,
        slot.dayOfWeek,
        slot.startTime,
        slot.endTime,
        slot.subjectCode,
        slot.subjectName,
        slot.faculty,
        slot.location,
        slot.type,
        slot.batch ?? null,
        index,
      );
    }

    await db.execAsync('COMMIT;');
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }
}

export async function listLectureSlots(): Promise<LectureSlot[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<LectureSlotRow>(`
    SELECT day_of_week, start_time, end_time, subject_code, subject_name, faculty, location, type, batch
    FROM lecture_slots
    WHERE timetable_id = 1
    ORDER BY
      CASE day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
        ELSE 8
      END ASC,
      start_time ASC,
      end_time ASC,
      sort_order ASC,
      id ASC
  `);

  return rows.map(mapLectureSlot);
}
