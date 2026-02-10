import * as Notifications from 'expo-notifications';
import { getTimetableRuntimeSnapshot } from '../modules/timetable/services/timetableRuntime';
import { TimetableRuntimeResult } from '../modules/timetable/types';

let latestLectureSnapshot: TimetableRuntimeResult = {
  currentLecture: null,
  nextLecture: null,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

export async function configureNotifications(): Promise<void> {
  latestLectureSnapshot = await getTimetableRuntimeSnapshot();

  // Placeholder for persistent notification wiring.
  // Uses the same runtime resolver snapshot shown on home/timetable view.
  await Promise.resolve();
}

export function getLatestLectureSnapshotForNotifications(): TimetableRuntimeResult {
  return latestLectureSnapshot;
}
