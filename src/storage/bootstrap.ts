import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_VERSION_KEY = 'college_app_storage_version';
const STORAGE_VERSION = '2';

const BOOTSTRAP_DEFAULTS: Record<string, string> = {
  action_items: JSON.stringify([]),
  timetable_entries: JSON.stringify([]),
  notification_schedule_state: JSON.stringify({ actionManager: {}, timetable: {} }),
  timetable_record_v2: JSON.stringify(null),
};

export async function initializeOfflineStorage(): Promise<void> {
  const currentVersion = await AsyncStorage.getItem(STORAGE_VERSION_KEY);

  if (currentVersion === STORAGE_VERSION) {
    return;
  }

  const writes = Object.entries(BOOTSTRAP_DEFAULTS).map(([key, value]) =>
    AsyncStorage.setItem(key, value),
  );

  writes.push(AsyncStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION));

  await Promise.all(writes);
}
