import { type LectureSlot } from "../types";

// Pure functions — deterministic, no side effects

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function nowToMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Finds the lecture currently in progress.
 * Returns null if no lecture is happening right now.
 */
export function getCurrentLecture(
  slots: LectureSlot[],
  now: Date,
): LectureSlot | null {
  const dayOfWeek = now.getDay();
  const currentMinutes = nowToMinutes(now);

  const todaySlots = slots.filter((s) => s.dayOfWeek === dayOfWeek);

  for (const slot of todaySlots) {
    const start = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);
    if (currentMinutes >= start && currentMinutes < end) {
      return slot;
    }
  }

  return null;
}

/**
 * Finds the next upcoming lecture (today only).
 * Returns null if there are no more lectures today.
 */
export function getNextLecture(
  slots: LectureSlot[],
  now: Date,
): LectureSlot | null {
  const dayOfWeek = now.getDay();
  const currentMinutes = nowToMinutes(now);

  const todaySlots = slots
    .filter((s) => s.dayOfWeek === dayOfWeek)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  for (const slot of todaySlots) {
    const start = timeToMinutes(slot.startTime);
    if (start > currentMinutes) {
      return slot;
    }
  }

  return null;
}

/**
 * Get today's full schedule sorted by start time.
 */
export function getTodaySchedule(
  slots: LectureSlot[],
  now: Date,
): LectureSlot[] {
  const dayOfWeek = now.getDay();
  return slots
    .filter((s) => s.dayOfWeek === dayOfWeek)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

/**
 * Format time from HH:MM to a human-readable string (e.g., "9:30 AM")
 */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 || 12;
  return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`;
}

/** Day names for display */
export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
export const DAY_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;
