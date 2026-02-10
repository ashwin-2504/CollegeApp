import { db } from "./db";
import { ActionItem, ActionViewType } from "../types";
import * as Crypto from "expo-crypto";
import { scheduleActionNotification } from "../services/notifications";

export const createAction = async (
  text: string,
  date?: string,
  time?: string,
  notes?: string,
): Promise<ActionItem> => {
  const id = Crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const action: ActionItem = { id, text, date, time, notes, createdAt };

  // Schedule notification
  const notificationId = await scheduleActionNotification(action);
  if (notificationId) {
    action.notificationId = notificationId;
  }

  await db.runAsync(
    `INSERT INTO actions (id, text, date, time, notes, createdAt, notificationId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      text,
      date ?? null,
      time ?? null,
      notes ?? null,
      createdAt,
      notificationId ?? null,
    ],
  );

  return action;
};

export const getActionsByView = async (
  viewType: ActionViewType,
): Promise<ActionItem[]> => {
  const today = new Date().toISOString().split("T")[0];
  let query = "";
  let params: any[] = [];

  switch (viewType) {
    case "NOW":
      // Date is today AND time is set
      query = `SELECT * FROM actions WHERE date = ? AND time IS NOT NULL AND completedAt IS NULL ORDER BY time ASC`;
      params = [today];
      break;
    case "UPCOMING":
      // Upcoming = (date >= today AND time IS NULL) OR (date > today AND time IS NOT NULL)
      query = `SELECT * FROM actions WHERE ((date >= ? AND time IS NULL) OR (date > ? AND time IS NOT NULL)) AND completedAt IS NULL ORDER BY date ASC, time ASC`;
      params = [today, today];
      break;
    case "UNSCHEDULED":
      query = `SELECT * FROM actions WHERE date IS NULL AND completedAt IS NULL ORDER BY createdAt DESC`;
      break;
  }

  const result = await db.getAllAsync<ActionItem>(query, params);
  return result;
};

export const updateAction = async (
  id: string,
  updates: Partial<ActionItem>,
) => {
  const fields = Object.keys(updates)
    .filter((k) => k !== "id")
    .map((k) => `${k} = ?`)
    .join(", ");
  const values = Object.keys(updates)
    .filter((k) => k !== "id")
    .map((k) => (updates as any)[k]);

  if (fields.length === 0) return;

  await db.runAsync(`UPDATE actions SET ${fields} WHERE id = ?`, [
    ...values,
    id,
  ]);
};

export const deleteAction = async (id: string) => {
  await db.runAsync(`DELETE FROM actions WHERE id = ?`, [id]);
};

export const completeAction = async (id: string) => {
  const completedAt = new Date().toISOString();
  await db.runAsync(`UPDATE actions SET completedAt = ? WHERE id = ?`, [
    completedAt,
    id,
  ]);
};
