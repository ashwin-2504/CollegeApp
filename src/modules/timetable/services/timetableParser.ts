import { DayOfWeek, LectureSlot, LectureType } from '../types';

const DAY_ALIASES: Record<string, DayOfWeek> = {
  mon: 'Monday',
  monday: 'Monday',
  tue: 'Tuesday',
  tues: 'Tuesday',
  tuesday: 'Tuesday',
  wed: 'Wednesday',
  wednesday: 'Wednesday',
  thu: 'Thursday',
  thur: 'Thursday',
  thurs: 'Thursday',
  thursday: 'Thursday',
  fri: 'Friday',
  friday: 'Friday',
  sat: 'Saturday',
  saturday: 'Saturday',
  sun: 'Sunday',
  sunday: 'Sunday',
};

const TYPE_ALIASES: Record<string, LectureType> = {
  lecture: 'Lecture',
  lec: 'Lecture',
  lab: 'Lab',
  tutorial: 'Tutorial',
  tut: 'Tutorial',
  seminar: 'Seminar',
  practical: 'Practical',
  prac: 'Practical',
};

export interface ParseResult {
  slots: LectureSlot[];
  warnings: string[];
}

// Deterministic rule-based parser.
// Expected line format:
// DAY | START-END | SUBJECT_CODE | SUBJECT_NAME | FACULTY | LOCATION | TYPE | BATCH(optional)
export function parseTimetableFromOcr(ocrText: string): ParseResult {
  const warnings: string[] = [];
  const slots: LectureSlot[] = [];

  const lines = ocrText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  lines.forEach((line, index) => {
    const parts = line.split('|').map((part) => part.trim());
    if (parts.length < 7) {
      warnings.push(`Line ${index + 1}: insufficient columns.`);
      return;
    }

    const day = normalizeDay(parts[0]);
    if (!day) {
      warnings.push(`Line ${index + 1}: invalid day value "${parts[0]}".`);
      return;
    }

    const timeRange = parseTimeRange(parts[1]);
    if (!timeRange) {
      warnings.push(`Line ${index + 1}: invalid time range "${parts[1]}".`);
      return;
    }

    const normalizedType = normalizeType(parts[6]);
    if (!normalizedType) {
      warnings.push(`Line ${index + 1}: invalid lecture type "${parts[6]}".`);
      return;
    }

    const slot: LectureSlot = {
      dayOfWeek: day,
      startTime: timeRange.start,
      endTime: timeRange.end,
      subjectCode: parts[2],
      subjectName: parts[3],
      faculty: parts[4],
      location: parts[5],
      type: normalizedType,
    };

    if (parts[7]) {
      slot.batch = parts[7];
    }

    slots.push(slot);
  });

  const dedupedSorted = sortAndDedupe(slots, warnings);
  return { slots: dedupedSorted, warnings };
}

function normalizeDay(value: string): DayOfWeek | null {
  return DAY_ALIASES[value.toLowerCase()] ?? null;
}

function normalizeType(value: string): LectureType | null {
  return TYPE_ALIASES[value.toLowerCase()] ?? null;
}

function parseTimeRange(value: string): { start: string; end: string } | null {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const startHour = Number(match[1]);
  const startMinute = Number(match[2]);
  const endHour = Number(match[3]);
  const endMinute = Number(match[4]);

  if (
    startHour > 23 ||
    endHour > 23 ||
    startMinute > 59 ||
    endMinute > 59 ||
    endHour * 60 + endMinute <= startHour * 60 + startMinute
  ) {
    return null;
  }

  return {
    start: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
    end: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
  };
}

function sortAndDedupe(slots: LectureSlot[], warnings: string[]): LectureSlot[] {
  const unique = new Map<string, LectureSlot>();
  slots.forEach((slot) => {
    const key = [
      slot.dayOfWeek,
      slot.startTime,
      slot.endTime,
      slot.subjectCode,
      slot.subjectName,
      slot.faculty,
      slot.location,
      slot.type,
      slot.batch ?? '',
    ].join('|');

    if (!unique.has(key)) {
      unique.set(key, slot);
    } else {
      warnings.push(`Duplicate slot ignored: ${key}`);
    }
  });

  const order: DayOfWeek[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  return Array.from(unique.values()).sort((a, b) => {
    const dayDiff = order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek);
    if (dayDiff !== 0) {
      return dayDiff;
    }

    return a.startTime.localeCompare(b.startTime);
  });
}
