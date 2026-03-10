// Timetable Builder — Presets
// Stamp all 6 days with identical empty slots at preset times.

import { ALL_DAYS, type DayNumber, type DaySlot } from "./types";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function createEmptySlot(startTime: string, endTime: string): DaySlot {
  return {
    id: generateId(),
    startTime,
    endTime,
    subjectName: "",
    subjectCode: "",
    faculty: "",
    location: "",
    type: "THEORY",
  };
}

interface Preset {
  label: string;
  description: string;
  slots: Array<{ start: string; end: string }>;
}

export const PRESETS: Preset[] = [
  {
    label: "6 periods",
    description: "09:30 – 03:10 with lunch break",
    slots: [
      { start: "09:30", end: "10:25" },
      { start: "10:25", end: "11:20" },
      { start: "11:30", end: "12:25" },
      { start: "12:25", end: "01:20" },
      { start: "02:15", end: "03:10" },
      { start: "03:10", end: "04:05" },
    ],
  },
  {
    label: "7 periods",
    description: "09:00 – 04:00 with lunch break",
    slots: [
      { start: "09:00", end: "09:55" },
      { start: "09:55", end: "10:50" },
      { start: "11:00", end: "11:55" },
      { start: "11:55", end: "12:50" },
      { start: "01:30", end: "02:25" },
      { start: "02:25", end: "03:20" },
      { start: "03:20", end: "04:15" },
    ],
  },
  {
    label: "8 periods",
    description: "08:30 – 04:30 with lunch break",
    slots: [
      { start: "08:30", end: "09:20" },
      { start: "09:20", end: "10:10" },
      { start: "10:20", end: "11:10" },
      { start: "11:10", end: "12:00" },
      { start: "12:00", end: "12:50" },
      { start: "01:30", end: "02:20" },
      { start: "02:20", end: "03:10" },
      { start: "03:10", end: "04:00" },
    ],
  },
];

/** Generate a full day map from a preset index */
export function generateFromPreset(
  presetIndex: number,
): Record<DayNumber, DaySlot[]> {
  const preset = PRESETS[presetIndex];
  if (!preset) throw new Error(`Invalid preset index: ${presetIndex}`);

  const days = {} as Record<DayNumber, DaySlot[]>;
  for (const day of ALL_DAYS) {
    days[day] = preset.slots.map((s) => createEmptySlot(s.start, s.end));
  }
  return days;
}

/** Generate empty day map (start from scratch) */
export function generateEmptyDays(): Record<DayNumber, DaySlot[]> {
  const days = {} as Record<DayNumber, DaySlot[]>;
  for (const day of ALL_DAYS) {
    days[day] = [];
  }
  return days;
}
