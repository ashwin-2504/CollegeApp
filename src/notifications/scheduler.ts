import * as Notifications from "expo-notifications";
import { ActionItem } from "../modules/actions/types";
import { listLectureSlots, listActionItems } from "../storage";

type NotificationRecord = {
  notificationId: string;
  fingerprint: string;
};

type NotificationState = {
  actionManager: Record<string, NotificationRecord>;
  timetable: Record<string, NotificationRecord>;
};

const TIMETABLE_NOTIFICATION_ENTITY_KEY = "timetable:current-next";
const NOTIFICATION_STATE_KEY = "notification_schedule_state_v2";
const DATE_CRITICAL_NOTIFICATION_HOUR = 9;
const DATE_CRITICAL_NOTIFICATION_MINUTE = 0;

const EMPTY_STATE: NotificationState = {
  actionManager: {},
  timetable: {},
};

let inMemoryState: NotificationState = EMPTY_STATE;

export async function reconcileNotificationSchedule(): Promise<void> {
  const [actionItems, lectureSlots] = await Promise.all([
    listActionItems(),
    listLectureSlots(),
  ]);

  const previousState = inMemoryState;
  const nextState: NotificationState = {
    actionManager: {},
    timetable: {},
  };

  await reconcileActionManagerNotifications(
    actionItems,
    previousState.actionManager,
    nextState.actionManager,
  );

  await reconcileTimetableNotification(
    lectureSlots,
    previousState.timetable,
    nextState.timetable,
  );

  await cancelStaleNotifications(previousState, nextState);
  inMemoryState = nextState;
  await Promise.resolve(NOTIFICATION_STATE_KEY);
}

async function reconcileActionManagerNotifications(
  items: ActionItem[],
  previousMap: Record<string, NotificationRecord>,
  nextMap: Record<string, NotificationRecord>,
): Promise<void> {
  for (const item of items) {
    const scheduleDate = getActionItemScheduleDate(item);
    if (!scheduleDate || scheduleDate.getTime() <= Date.now()) {
      continue;
    }

    const entityKey = `action:${item.id}`;
    const fingerprint = `action:${item.id}:${scheduleDate.toISOString()}`;
    const previous = previousMap[entityKey];

    if (previous && previous.fingerprint === fingerprint) {
      nextMap[entityKey] = previous;
      continue;
    }

    if (previous) {
      await Notifications.cancelScheduledNotificationAsync(
        previous.notificationId,
      );
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Action due",
        body: item.text,
        sound: false,
      },
      trigger: scheduleDate as any,
    });

    nextMap[entityKey] = { notificationId, fingerprint };
  }
}

async function reconcileTimetableNotification(
  slots: Awaited<ReturnType<typeof listLectureSlots>>,
  previousMap: Record<string, NotificationRecord>,
  nextMap: Record<string, NotificationRecord>,
): Promise<void> {
  const now = new Date();
  const dayName = getDayName(now);
  const todaySlots = slots.filter((slot) => slot.dayOfWeek === dayName);

  const current = todaySlots.find((slot) => {
    const start = toMinutes(slot.startTime);
    const end = toMinutes(slot.endTime);
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    return minutesNow >= start && minutesNow < end;
  });

  const next = todaySlots.find(
    (slot) =>
      toMinutes(slot.startTime) > now.getHours() * 60 + now.getMinutes(),
  );

  const displayText = current
    ? `Now: ${current.subjectName} until ${current.endTime}`
    : next
      ? `Next: ${next.subjectName} at ${next.startTime}`
      : "No upcoming lectures today";

  const transitionPoints = new Set<number>();
  for (const slot of todaySlots) {
    const start = toTodayDate(slot.startTime, now);
    const end = toTodayDate(slot.endTime, now);

    if (start.getTime() > now.getTime()) {
      transitionPoints.add(start.getTime());
    }

    if (end.getTime() > now.getTime()) {
      transitionPoints.add(end.getTime());
    }
  }

  const orderedTransitionPoints = [...transitionPoints].sort((a, b) => a - b);
  const fingerprint = `timetable:${displayText}:${orderedTransitionPoints.join(",")}`;
  const previous = previousMap[TIMETABLE_NOTIFICATION_ENTITY_KEY];

  if (previous && previous.fingerprint === fingerprint) {
    nextMap[TIMETABLE_NOTIFICATION_ENTITY_KEY] = previous;
    return;
  }

  if (previous) {
    await Notifications.cancelScheduledNotificationAsync(
      previous.notificationId,
    );
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Timetable",
      body: displayText,
      sound: false,
      sticky: true,
      autoDismiss: false,
      priority: Notifications.AndroidNotificationPriority.MIN,
    },
    trigger: null,
  });

  for (const transitionTime of orderedTransitionPoints) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Timetable",
        body: "Refreshing lecture status…",
        sound: false,
        priority: Notifications.AndroidNotificationPriority.MIN,
      },
      trigger: new Date(transitionTime) as any,
    });
  }

  nextMap[TIMETABLE_NOTIFICATION_ENTITY_KEY] = { notificationId, fingerprint };
}

async function cancelStaleNotifications(
  previousState: NotificationState,
  nextState: NotificationState,
): Promise<void> {
  const cancelIfMissing = async (
    previousMap: Record<string, NotificationRecord>,
    nextMap: Record<string, NotificationRecord>,
  ) => {
    for (const [entityKey, record] of Object.entries(previousMap)) {
      if (!nextMap[entityKey]) {
        await Notifications.cancelScheduledNotificationAsync(
          record.notificationId,
        );
      }
    }
  };

  await cancelIfMissing(previousState.actionManager, nextState.actionManager);
  await cancelIfMissing(previousState.timetable, nextState.timetable);
}

function getActionItemScheduleDate(item: ActionItem): Date | null {
  if (!item.date) {
    return null;
  }

  if (item.time) {
    return parseLocalDateTime(item.date, item.time);
  }

  return parseLocalDateTime(
    item.date,
    `${DATE_CRITICAL_NOTIFICATION_HOUR.toString().padStart(2, "0")}:${DATE_CRITICAL_NOTIFICATION_MINUTE.toString().padStart(
      2,
      "0",
    )}`,
  );
}

function parseLocalDateTime(datePart: string, timePart: string): Date | null {
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function getDayName(now: Date): string {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][now.getDay()];
}

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTodayDate(time: string, now: Date): Date {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0,
  );
}
