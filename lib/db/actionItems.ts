import { type SQLiteDatabase } from "expo-sqlite";
import { type ActionItem } from "../types";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function rowToActionItem(row: any): ActionItem {
  return {
    id: row.id,
    text: row.text,
    date: row.date ?? null,
    time: row.time ?? null,
    notes: row.notes ?? null,
    notificationId: row.notification_id ?? null,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? null,
  };
}

export async function createActionItem(
  db: SQLiteDatabase,
  text: string,
  date: string | null,
  time: string | null,
  notes: string | null,
  notificationId: string | null = null,
): Promise<ActionItem> {
  const id = generateId();
  const createdAt = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO action_items (id, text, date, time, notes, notification_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, text, date, time, notes, notificationId, createdAt],
  );

  return {
    id,
    text,
    date,
    time,
    notes,
    notificationId,
    createdAt,
    completedAt: null,
  };
}

export async function updateActionItem(
  db: SQLiteDatabase,
  id: string,
  updates: Partial<
    Pick<ActionItem, "text" | "date" | "time" | "notes" | "notificationId">
  >,
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.text !== undefined) {
    fields.push("text = ?");
    values.push(updates.text);
  }
  if (updates.date !== undefined) {
    fields.push("date = ?");
    values.push(updates.date);
  }
  if (updates.time !== undefined) {
    fields.push("time = ?");
    values.push(updates.time);
  }
  if (updates.notes !== undefined) {
    fields.push("notes = ?");
    values.push(updates.notes);
  }
  if (updates.notificationId !== undefined) {
    fields.push("notification_id = ?");
    values.push(updates.notificationId);
  }

  if (fields.length === 0) return;
  values.push(id);

  await db.runAsync(
    `UPDATE action_items SET ${fields.join(", ")} WHERE id = ?`,
    values,
  );
}

export async function toggleComplete(
  db: SQLiteDatabase,
  id: string,
): Promise<string | null> {
  const row = await db.getFirstAsync<{ completed_at: string | null }>(
    "SELECT completed_at FROM action_items WHERE id = ?",
    [id],
  );

  const newCompletedAt = row?.completed_at ? null : new Date().toISOString();
  await db.runAsync("UPDATE action_items SET completed_at = ? WHERE id = ?", [
    newCompletedAt,
    id,
  ]);

  return newCompletedAt;
}

export async function deleteActionItem(
  db: SQLiteDatabase,
  id: string,
): Promise<void> {
  await db.runAsync("DELETE FROM action_items WHERE id = ?", [id]);
}

/** Now View: today's time-critical tasks, sorted by time */
export async function getNowTasks(
  db: SQLiteDatabase,
  todayDate: string, // YYYY-MM-DD
): Promise<ActionItem[]> {
  const rows = await db.getAllAsync(
    `SELECT * FROM action_items
     WHERE date = ? AND time IS NOT NULL AND completed_at IS NULL
     ORDER BY time ASC`,
    [todayDate],
  );
  return rows.map(rowToActionItem);
}

/** Upcoming View: date-critical tasks (no time), grouped by date */
export async function getUpcomingTasks(
  db: SQLiteDatabase,
): Promise<ActionItem[]> {
  const rows = await db.getAllAsync(
    `SELECT * FROM action_items
     WHERE date IS NOT NULL AND time IS NULL AND completed_at IS NULL
     ORDER BY date ASC, created_at ASC`,
  );
  return rows.map(rowToActionItem);
}

/** Unscheduled View: tasks with no date */
export async function getUnscheduledTasks(
  db: SQLiteDatabase,
): Promise<ActionItem[]> {
  const rows = await db.getAllAsync(
    `SELECT * FROM action_items
     WHERE date IS NULL AND completed_at IS NULL
     ORDER BY created_at DESC`,
  );
  return rows.map(rowToActionItem);
}

/** Get all incomplete tasks (for notification reconciliation) */
export async function getAllIncompleteTasks(
  db: SQLiteDatabase,
): Promise<ActionItem[]> {
  const rows = await db.getAllAsync(
    `SELECT * FROM action_items
     WHERE completed_at IS NULL AND (date IS NOT NULL OR time IS NOT NULL)
     ORDER BY date ASC, time ASC`,
  );
  return rows.map(rowToActionItem);
}

/** Get a single action item by ID */
export async function getActionItemById(
  db: SQLiteDatabase,
  id: string,
): Promise<ActionItem | null> {
  const row = await db.getFirstAsync(
    "SELECT * FROM action_items WHERE id = ?",
    [id],
  );
  return row ? rowToActionItem(row) : null;
}
