// Timetable Builder — Types
// Each day owns its own independent slot list. Slots are ID-based.

export type DayNumber = 1 | 2 | 3 | 4 | 5 | 6; // Mon–Sat

export const ALL_DAYS: DayNumber[] = [1, 2, 3, 4, 5, 6];

export const DAY_LABELS: Record<DayNumber, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const DAY_SHORT_LABELS: Record<DayNumber, string> = {
  1: "MON",
  2: "TUE",
  3: "WED",
  4: "THU",
  5: "FRI",
  6: "SAT",
};

export type SlotType = "THEORY" | "LAB" | "OTHER";

/** A single timetable slot — each has a stable ID */
export interface DaySlot {
  id: string;
  startTime: string; // "HH:MM" 24-hour
  endTime: string; // "HH:MM" 24-hour
  subjectName: string;
  subjectCode: string;
  faculty: string;
  location: string;
  type: SlotType;
}

export type BuilderPhase = "preset" | "fill";

/** Validation error for a specific slot */
export interface ValidationError {
  day: DayNumber;
  slotId: string;
  type: "INVALID_TIME" | "OVERLAP" | "EMPTY_SUBJECT";
  message: string;
}

/** Non-blocking warning */
export interface ValidationWarning {
  day: DayNumber;
  slotId?: string;
  type: "EMPTY_SLOT" | "GAP";
  message: string;
}

export interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  filledCount: number;
  totalCount: number;
  canSave: boolean; // true if 0 errors + ≥1 filled
}

export interface TimetableState {
  phase: BuilderPhase;
  days: Record<DayNumber, DaySlot[]>;
  activeEditor: { day: DayNumber; slotId: string } | null;
  validation: ValidationResult;
}

// ── Actions ────────────────────────────────────────────────

export type TimetableAction =
  | { type: "APPLY_PRESET"; days: Record<DayNumber, DaySlot[]> }
  | { type: "START_FILL" }
  | {
      type: "FILL_SLOT";
      day: DayNumber;
      slotId: string;
      data: Partial<Omit<DaySlot, "id">>;
    }
  | { type: "CLEAR_SLOT"; day: DayNumber; slotId: string }
  | { type: "ADD_SLOT"; day: DayNumber; startTime: string; endTime: string }
  | { type: "REMOVE_SLOT"; day: DayNumber; slotId: string }
  | { type: "MERGE_DOWN"; day: DayNumber; slotId: string }
  | { type: "UNMERGE"; day: DayNumber; slotId: string }
  | { type: "APPLY_PATTERN"; fromDay: DayNumber; toDays: DayNumber[] }
  | { type: "CLEAR_DAY"; day: DayNumber }
  | { type: "SET_EDITOR"; day: DayNumber; slotId: string }
  | { type: "CLOSE_EDITOR" }
  | { type: "LOAD_EXISTING"; days: Record<DayNumber, DaySlot[]> }
  | { type: "RESET_ALL" };
