import { ActionItem } from '../../modules/actions/types';
import { getDatabase } from '../sqlite';

type ActionItemRow = {
  id: string;
  text: string;
  date: string | null;
  time: string | null;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
};

function mapRowToActionItem(row: ActionItemRow): ActionItem {
  return {
    id: row.id,
    text: row.text,
    date: row.date ?? undefined,
    time: row.time ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
  };
}

export async function listActionItems(): Promise<ActionItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ActionItemRow>(`
    SELECT id, text, date, time, notes, created_at, completed_at
    FROM action_items
    ORDER BY
      CASE WHEN date IS NULL THEN 1 ELSE 0 END,
      date ASC,
      CASE WHEN time IS NULL THEN 1 ELSE 0 END,
      time ASC,
      created_at ASC,
      id ASC
  `);

  return rows.map(mapRowToActionItem);
}

export async function createActionItem(item: ActionItem): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO action_items (id, text, date, time, notes, created_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    item.id,
    item.text,
    item.date ?? null,
    item.time ?? null,
    item.notes ?? null,
    item.createdAt,
    item.completedAt ?? null,
  );
}

export async function updateActionItem(item: ActionItem): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE action_items
     SET text = ?, date = ?, time = ?, notes = ?, completed_at = ?
     WHERE id = ?`,
    item.text,
    item.date ?? null,
    item.time ?? null,
    item.notes ?? null,
    item.completedAt ?? null,
    item.id,
  );
}

export async function deleteActionItem(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM action_items WHERE id = ?', id);
}
