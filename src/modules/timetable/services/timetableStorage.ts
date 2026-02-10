import { getTimetableRecord as getStoredTimetableRecord, saveLockedTimetable as saveStoredLockedTimetable } from '../../../storage';
import { TimetableRecord } from '../types';

export async function getTimetableRecord(): Promise<TimetableRecord | null> {
  return getStoredTimetableRecord();
}

export async function saveLockedTimetable(record: TimetableRecord): Promise<void> {
  await saveStoredLockedTimetable(record);
}
