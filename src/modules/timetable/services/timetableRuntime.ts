import { getTimetableRecord } from './timetableStorage';
import { resolveCurrentAndNextLecture } from './timetableResolver';
import { TimetableRuntimeResult } from '../types';

export async function getTimetableRuntimeSnapshot(): Promise<TimetableRuntimeResult> {
  const record = await getTimetableRecord();
  if (!record) {
    return { currentLecture: null, nextLecture: null };
  }

  return resolveCurrentAndNextLecture(record.slots);
}
