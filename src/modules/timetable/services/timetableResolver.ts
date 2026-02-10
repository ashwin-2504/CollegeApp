import { LectureSlot, TimetableRuntimeResult } from '../types';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export function resolveCurrentAndNextLecture(
  slots: LectureSlot[],
  now: Date = new Date(),
): TimetableRuntimeResult {
  const todayName = DAY_NAMES[now.getDay()];
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  const todaySlots = slots.filter((slot) => slot.dayOfWeek === todayName);

  const currentLecture =
    todaySlots.find((slot) => {
      const start = toMinutes(slot.startTime);
      const end = toMinutes(slot.endTime);
      return minutesNow >= start && minutesNow < end;
    }) ?? null;

  if (currentLecture) {
    const nextLecture =
      todaySlots
        .filter((slot) => toMinutes(slot.startTime) >= toMinutes(currentLecture.endTime))
        .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))[0] ?? null;

    return { currentLecture, nextLecture };
  }

  const nextToday =
    todaySlots
      .filter((slot) => toMinutes(slot.startTime) > minutesNow)
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))[0] ?? null;

  if (nextToday) {
    return { currentLecture: null, nextLecture: nextToday };
  }

  return { currentLecture: null, nextLecture: null };
}

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}
