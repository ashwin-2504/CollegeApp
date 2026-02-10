import { ActionItem } from './types';

type UpcomingGroup = {
  date: string;
  items: ActionItem[];
};

const dateOnlyFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const friendlyDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

export function getTodayDateString(now: Date = new Date()) {
  return dateOnlyFormatter.format(now);
}

function timeToSortKey(time: string) {
  const [hours, minutes] = time.split(':').map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return hours * 60 + minutes;
}

export function selectNowItems(items: ActionItem[], now: Date = new Date()) {
  const today = getTodayDateString(now);

  return items
    .filter((item) => item.date === today && Boolean(item.time))
    .sort((a, b) => timeToSortKey(a.time ?? '') - timeToSortKey(b.time ?? ''));
}

export function selectUpcomingGroups(items: ActionItem[]) {
  const grouped = items
    .filter((item) => Boolean(item.date) && !item.time)
    .reduce<Record<string, ActionItem[]>>((acc, item) => {
      const groupDate = item.date!;
      if (!acc[groupDate]) {
        acc[groupDate] = [];
      }
      acc[groupDate].push(item);
      return acc;
    }, {});

  return Object.entries(grouped)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, groupItems]) => ({ date, items: groupItems })) satisfies UpcomingGroup[];
}

export function selectUnscheduledItems(items: ActionItem[]) {
  return items.filter((item) => !item.date);
}

export function formatFriendlyDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return friendlyDateFormatter.format(parsed);
}
