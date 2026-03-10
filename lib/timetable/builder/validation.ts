// Timetable Builder — Validation Engine
// Pure function, O(n) per day. Runs after every dispatch.

import {
  ALL_DAYS,
  DAY_LABELS,
  type DayNumber,
  type TimetableState,
  type ValidationError,
  type ValidationResult,
  type ValidationWarning,
} from "./types";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function isValidTimeFormat(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time);
}

export function validate(state: TimetableState): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  let filledCount = 0;
  let totalCount = 0;

  for (const dayNum of ALL_DAYS) {
    const slots = state.days[dayNum];
    if (!slots) continue;

    totalCount += slots.length;

    // Check each slot
    for (const slot of slots) {
      // Valid time format
      if (
        !isValidTimeFormat(slot.startTime) ||
        !isValidTimeFormat(slot.endTime)
      ) {
        errors.push({
          day: dayNum,
          slotId: slot.id,
          type: "INVALID_TIME",
          message: `Invalid time format in ${DAY_LABELS[dayNum]}`,
        });
        continue;
      }

      // startTime < endTime
      const startMin = timeToMinutes(slot.startTime);
      const endMin = timeToMinutes(slot.endTime);
      if (startMin >= endMin) {
        errors.push({
          day: dayNum,
          slotId: slot.id,
          type: "INVALID_TIME",
          message: `Start time must be before end time in ${DAY_LABELS[dayNum]}`,
        });
      }

      // Filled check
      if (slot.subjectName.trim()) {
        filledCount++;
      } else {
        warnings.push({
          day: dayNum,
          slotId: slot.id,
          type: "EMPTY_SLOT",
          message: `Empty slot in ${DAY_LABELS[dayNum]} (${slot.startTime}–${slot.endTime})`,
        });
      }
    }

    // Overlap check: sort by startTime, compare adjacent
    const sorted = [...slots]
      .filter(
        (s) => isValidTimeFormat(s.startTime) && isValidTimeFormat(s.endTime),
      )
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      const currentEnd = timeToMinutes(current.endTime);
      const nextStart = timeToMinutes(next.startTime);

      if (currentEnd > nextStart) {
        errors.push({
          day: dayNum,
          slotId: next.id,
          type: "OVERLAP",
          message: `Time overlap in ${DAY_LABELS[dayNum]}: ${current.startTime}–${current.endTime} overlaps with ${next.startTime}–${next.endTime}`,
        });
      } else if (currentEnd < nextStart) {
        // Gap between slots — warning, not error
        warnings.push({
          day: dayNum,
          type: "GAP",
          message: `Gap in ${DAY_LABELS[dayNum]} between ${current.endTime} and ${next.startTime}`,
        });
      }
    }
  }

  return {
    errors,
    warnings,
    filledCount,
    totalCount,
    canSave: errors.length === 0 && filledCount > 0,
  };
}

/** Check if a specific slot has any errors */
export function getSlotErrors(
  validation: ValidationResult,
  day: DayNumber,
  slotId: string,
): ValidationError[] {
  return validation.errors.filter((e) => e.day === day && e.slotId === slotId);
}

/** Check if a specific slot has warnings */
export function isSlotWarning(
  validation: ValidationResult,
  day: DayNumber,
  slotId: string,
): boolean {
  return validation.warnings.some((w) => w.day === day && w.slotId === slotId);
}
