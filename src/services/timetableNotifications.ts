import * as Notifications from "expo-notifications";
import { LectureSlot } from "../types";

export const updateTimetableNotification = async (
  current: LectureSlot | null,
  next: LectureSlot | null,
) => {
  // "Silent, persistent notification"
  // "Updates automatically as time changes"
  // "No sound, no vibration"

  const title = current
    ? `Now: ${current.subjectName || current.subjectCode}`
    : "No Class Now";
  const body = current
    ? `${current.startTime} - ${current.endTime} @ ${current.location}`
    : next
      ? `Next: ${next.subjectName || next.subjectCode} @ ${next.startTime}`
      : "No classes for the rest of the day";

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sticky: true, // Android only: makes it persistent
      priority: Notifications.AndroidNotificationPriority.LOW, // Silent
      sound: false,
      vibrate: [],
    },
    trigger: null, // Show immediately
  });
};
