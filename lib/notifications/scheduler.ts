/**
 * Notification scheduler — uses dynamic import() to avoid
 * expo-notifications push token auto-registration side-effect
 * which crashes in Expo Go SDK 53+.
 *
 * All functions lazy-load the module only when actually called.
 */

import {
  DAILY_NOTIFICATION_HOUR,
  DAILY_NOTIFICATION_MINUTE,
} from "../constants";
import { type ActionItem } from "../types";

// Lazy-loaded module reference (cached after first load)
let _notifications: typeof import("expo-notifications") | null = null;

async function getNotifications() {
  if (!_notifications) {
    _notifications = await import("expo-notifications");
  }
  return _notifications;
}

/** Configure notification defaults — call once at app start */
export async function configureNotifications(): Promise<void> {
  try {
    const Notifications = await getNotifications();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Request permissions (local notifications only — no push tokens needed)
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.warn("Notification permissions not granted");
    }
  } catch (e) {
    // Expo Go removed push notification native module in SDK 53+.
    // Local scheduling may still work; this prevents a crash on startup.
    console.warn("Notification setup warning (expected in Expo Go):", e);
  }
}

/**
 * Schedule a notification for a task.
 * - date + time → exact datetime
 * - date only → 9:00 AM on that date
 * - no date → no notification
 *
 * Returns the notification identifier or null.
 */
export async function scheduleTaskNotification(
  item: ActionItem,
): Promise<string | null> {
  if (!item.date) return null;

  try {
    const Notifications = await getNotifications();
    const [year, month, day] = item.date.split("-").map(Number);

    let triggerDate: Date;

    if (item.time) {
      const [hour, minute] = item.time.split(":").map(Number);
      triggerDate = new Date(year, month - 1, day, hour, minute, 0);
    } else {
      triggerDate = new Date(
        year,
        month - 1,
        day,
        DAILY_NOTIFICATION_HOUR,
        DAILY_NOTIFICATION_MINUTE,
        0,
      );
    }

    // Don't schedule notifications in the past
    if (triggerDate.getTime() <= Date.now()) return null;

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: item.time ? "⏰ Task Due Now" : "📋 Task Due Today",
        body: item.text,
        data: { taskId: item.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    return identifier;
  } catch {
    // Notifications unavailable in this environment
    return null;
  }
}

/**
 * Cancel a scheduled notification by identifier.
 * Always call this before rescheduling or deleting a task.
 */
export async function cancelTaskNotification(
  notificationId: string | null,
): Promise<void> {
  if (!notificationId) return;
  try {
    const Notifications = await getNotifications();
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Notification may have already fired or been cancelled
  }
}

/**
 * Reconcile notifications on app launch.
 * Cancels orphaned notifications and reschedules missing ones.
 */
export async function reconcileNotifications(
  incompleteTasks: ActionItem[],
  updateNotificationId: (
    taskId: string,
    notificationId: string | null,
  ) => Promise<void>,
): Promise<void> {
  try {
    const Notifications = await getNotifications();

    // Get all currently scheduled notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const scheduledIds = new Set(scheduled.map((n) => n.identifier));
    const taskNotificationIds = new Set(
      incompleteTasks
        .filter((t) => t.notificationId)
        .map((t) => t.notificationId!),
    );

    // Cancel orphans (scheduled but no matching task)
    for (const notification of scheduled) {
      if (!taskNotificationIds.has(notification.identifier)) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier,
        );
      }
    }

    // Reschedule missing (task exists but no scheduled notification)
    for (const task of incompleteTasks) {
      if (task.notificationId && scheduledIds.has(task.notificationId)) {
        continue; // Already scheduled, nothing to do
      }

      // Cancel stale ID if it exists
      if (task.notificationId) {
        await cancelTaskNotification(task.notificationId);
      }

      // Schedule new notification
      const newId = await scheduleTaskNotification(task);
      await updateNotificationId(task.id, newId);
    }
  } catch {
    // Notifications unavailable in this environment
    console.warn("Notification reconciliation skipped (expected in Expo Go)");
  }
}
