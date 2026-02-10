import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimetableRecord } from '../types';

const TIMETABLE_RECORD_KEY = 'timetable_record_v2';

export async function getTimetableRecord(): Promise<TimetableRecord | null> {
  const raw = await AsyncStorage.getItem(TIMETABLE_RECORD_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as TimetableRecord;
  } catch {
    return null;
  }
}

export async function saveLockedTimetable(record: TimetableRecord): Promise<void> {
  await AsyncStorage.setItem(TIMETABLE_RECORD_KEY, JSON.stringify(record));
}
