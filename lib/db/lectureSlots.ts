import { type SQLiteDatabase } from "expo-sqlite";
import { type CreateLectureSlotInput, type LectureSlot } from "../types";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function rowToLectureSlot(row: any): LectureSlot {
  return {
    id: row.id,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
    subjectCode: row.subject_code ?? null,
    subjectName: row.subject_name,
    faculty: row.faculty ?? null,
    location: row.location ?? null,
    type: row.type as LectureSlot["type"],
    batch: row.batch ?? null,
  };
}

export async function addLectureSlot(
  db: SQLiteDatabase,
  input: CreateLectureSlotInput,
): Promise<LectureSlot> {
  const id = generateId();

  await db.runAsync(
    `INSERT INTO lecture_slots (id, day_of_week, start_time, end_time, subject_code, subject_name, faculty, location, type, batch)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.dayOfWeek,
      input.startTime,
      input.endTime,
      input.subjectCode,
      input.subjectName,
      input.faculty,
      input.location,
      input.type,
      input.batch,
    ],
  );

  return { id, ...input };
}

export async function bulkAddLectureSlots(
  db: SQLiteDatabase,
  inputs: CreateLectureSlotInput[],
): Promise<void> {
  for (const input of inputs) {
    await addLectureSlot(db, input);
  }
}

export async function getLectureSlotsByDay(
  db: SQLiteDatabase,
  dayOfWeek: number,
): Promise<LectureSlot[]> {
  const rows = await db.getAllAsync(
    `SELECT * FROM lecture_slots
     WHERE day_of_week = ?
     ORDER BY start_time ASC`,
    [dayOfWeek],
  );
  return rows.map(rowToLectureSlot);
}

export async function getAllLectureSlots(
  db: SQLiteDatabase,
): Promise<LectureSlot[]> {
  const rows = await db.getAllAsync(
    "SELECT * FROM lecture_slots ORDER BY day_of_week ASC, start_time ASC",
  );
  return rows.map(rowToLectureSlot);
}

export async function deleteLectureSlot(
  db: SQLiteDatabase,
  id: string,
): Promise<void> {
  await db.runAsync("DELETE FROM lecture_slots WHERE id = ?", [id]);
}

export async function clearAllSlots(db: SQLiteDatabase): Promise<void> {
  await db.runAsync("DELETE FROM lecture_slots");
}

export async function clearSlotsForDay(
  db: SQLiteDatabase,
  dayOfWeek: number,
): Promise<void> {
  await db.runAsync("DELETE FROM lecture_slots WHERE day_of_week = ?", [
    dayOfWeek,
  ]);
}

export async function hasLectureSlots(db: SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM lecture_slots",
  );
  return (row?.count ?? 0) > 0;
}
