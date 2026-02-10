import * as Notifications from "expo-notifications";
import { getTimetableRuntimeSnapshot } from "../modules/timetable/services/timetableRuntime";
import { TimetableRuntimeResult } from "../modules/timetable/types";
import { reconcileNotificationSchedule } from "./scheduler";

let latestLectureSnapshot: TimetableRuntimeResult = {
  currentLecture: null,
  nextLecture: null,
};

Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }) as any,
});

export async function configureNotifications(): Promise<void> {
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null,
    vibrationPattern: [0],
  });

  await Notifications.setNotificationChannelAsync("timetable-silent", {
    name: "Timetable Silent",
    importance: Notifications.AndroidImportance.LOW,
    sound: null,
    vibrationPattern: [0],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });

  try {
    await Notifications.requestPermissionsAsync();
  } catch (e) {
    // requestPermissionsAsync may fail in Expo Go (SDK 53+)
    console.log("Notification permissions request skipped (Expo Go)");
  }
  await reconcileNotificationSchedule();
  latestLectureSnapshot = await getTimetableRuntimeSnapshot();

  // Placeholder for persistent notification wiring.
  // Uses the same runtime resolver snapshot shown on home/timetable view.
  await Promise.resolve();
}

export function getLatestLectureSnapshotForNotifications(): TimetableRuntimeResult {
  return latestLectureSnapshot;
}
