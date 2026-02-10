import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

type TaskCriticality = 'time-critical' | 'date-critical';

type ActionItem = {
  id?: string;
  title?: string;
  dueDate?: string;
  dueTime?: string;
  criticality?: TaskCriticality;
};

type TimetableEntry = {
  id?: string;
  title?: string;
  startAt?: string;
  endAt?: string;
  location?: string;
};

type NotificationRecord = {
  notificationId: string;
  fingerprint: string;
};

type NotificationState = {
  actionManager: Record<string, NotificationRecord>;
  timetable: Record<string, NotificationRecord>;
};

const ACTION_ITEMS_KEY = 'action_items';
const TIMETABLE_ENTRIES_KEY = 'timetable_entries';
const NOTIFICATION_STATE_KEY = 'notification_schedule_state';
const DATE_CRITICAL_NOTIFICATION_HOUR = 9;
const DATE_CRITICAL_NOTIFICATION_MINUTE = 0;
const TIMETABLE_NOTIFICATION_ENTITY_KEY = 'timetable:current-next';

const EMPTY_STATE: NotificationState = {
  actionManager: {},
  timetable: {},
};

export async function reconcileNotificationSchedule(): Promise<void> {
  const [actionItems, timetableEntries, previousState] = await Promise.all([
    readJsonArray<ActionItem>(ACTION_ITEMS_KEY),
    readJsonArray<TimetableEntry>(TIMETABLE_ENTRIES_KEY),
    readNotificationState(),
  ]);

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
    timetableEntries,
    previousState.timetable,
    nextState.timetable,
  );

  await cancelStaleNotifications(previousState, nextState);
  await AsyncStorage.setItem(NOTIFICATION_STATE_KEY, JSON.stringify(nextState));
}

async function reconcileActionManagerNotifications(
  items: ActionItem[],
  previousMap: Record<string, NotificationRecord>,
  nextMap: Record<string, NotificationRecord>,
): Promise<void> {
  for (const [index, item] of items.entries()) {
    const scheduleDate = getActionItemScheduleDate(item);
    if (!scheduleDate || scheduleDate.getTime() <= Date.now()) {
      continue;
    }

    const entityKey = buildActionItemEntityKey(item, index);
    const fingerprint = `action:${entityKey}:${scheduleDate.toISOString()}`;
    const previous = previousMap[entityKey];

    if (previous && previous.fingerprint === fingerprint) {
      nextMap[entityKey] = previous;
      continue;
    }

    if (previous) {
      await Notifications.cancelScheduledNotificationAsync(previous.notificationId);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Action due',
        body: item.title ?? 'You have a task that is due now.',
        sound: false,
      },
      trigger: scheduleDate,
    });

    nextMap[entityKey] = { notificationId, fingerprint };
  }
}

async function reconcileTimetableNotification(
  entries: TimetableEntry[],
  previousMap: Record<string, NotificationRecord>,
  nextMap: Record<string, NotificationRecord>,
): Promise<void> {
  const sorted = entries
    .map((entry, index) => ({ entry, index }))
    .map(({ entry, index }) => {
      const start = parseIsoDate(entry.startAt);
      const end = parseIsoDate(entry.endAt);
      return { entry, index, start, end };
    })
    .filter(
      (item): item is { entry: TimetableEntry; index: number; start: Date; end: Date } =>
        Boolean(item.start && item.end),
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const now = new Date();
  const current = sorted.find(({ start, end }) => start <= now && now < end);
  const next = sorted.find(({ start }) => start > now);

  const displayText = current
    ? `Now: ${current.entry.title ?? 'Lecture'} until ${formatLocalTime(current.end)}`
    : next
      ? `Next: ${next.entry.title ?? 'Lecture'} at ${formatLocalTime(next.start)}`
      : 'No upcoming lectures today';

  const transitionPoints = new Set<number>();
  for (const item of sorted) {
    if (item.start.getTime() > now.getTime()) {
      transitionPoints.add(item.start.getTime());
    }

    if (item.end.getTime() > now.getTime()) {
      transitionPoints.add(item.end.getTime());
    }
  }

  const orderedTransitionPoints = [...transitionPoints].sort((a, b) => a - b);
  const fingerprint = `timetable:${displayText}:${orderedTransitionPoints.join(',')}`;
  const previous = previousMap[TIMETABLE_NOTIFICATION_ENTITY_KEY];

  if (previous && previous.fingerprint === fingerprint) {
    nextMap[TIMETABLE_NOTIFICATION_ENTITY_KEY] = previous;
    return;
  }

  if (previous) {
    await Notifications.cancelScheduledNotificationAsync(previous.notificationId);
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Timetable',
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
        title: 'Timetable',
        body: 'Refreshing lecture status…',
        sound: false,
        priority: Notifications.AndroidNotificationPriority.MIN,
      },
      trigger: new Date(transitionTime),
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
        await Notifications.cancelScheduledNotificationAsync(record.notificationId);
      }
    }
  };

  await cancelIfMissing(previousState.actionManager, nextState.actionManager);
  await cancelIfMissing(previousState.timetable, nextState.timetable);
}

function getActionItemScheduleDate(item: ActionItem): Date | null {
  if (!item.dueDate) {
    return null;
  }

  if (item.criticality === 'time-critical') {
    if (!item.dueTime) {
      return null;
    }

    const dateTime = parseLocalDateTime(item.dueDate, item.dueTime);
    return dateTime;
  }

  const localDate = parseLocalDateTime(
    item.dueDate,
    `${DATE_CRITICAL_NOTIFICATION_HOUR.toString().padStart(2, '0')}:${DATE_CRITICAL_NOTIFICATION_MINUTE
      .toString()
      .padStart(2, '0')}`,
  );

  return localDate;
}

function buildActionItemEntityKey(item: ActionItem, index: number): string {
  return `action:${item.id ?? `${item.title ?? 'untitled'}:${item.dueDate ?? 'unknown'}:${item.dueTime ?? 'none'}:${index}`}`;
}

async function readJsonArray<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function readNotificationState(): Promise<NotificationState> {
  const raw = await AsyncStorage.getItem(NOTIFICATION_STATE_KEY);
  if (!raw) {
    return EMPTY_STATE;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<NotificationState>;
    return {
      actionManager: parsed.actionManager ?? {},
      timetable: parsed.timetable ?? {},
    };
  } catch {
    return EMPTY_STATE;
  }
}

function parseLocalDateTime(datePart: string, timePart: string): Date | null {
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

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

function parseIsoDate(value?: string): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatLocalTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
