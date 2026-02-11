// Thin domain layer — centralizes task rules
// MVP: no recurrence, no reminders, no sync

import { type SQLiteDatabase } from "expo-sqlite";
import * as ActionItemsDB from "../db/actionItems";
import * as Scheduler from "../notifications/scheduler";
import { type ActionItem, type CreateActionItemInput } from "../types";

/**
 * Create a task with proper notification scheduling.
 * Single entry point for task creation — screens should call this, not DB directly.
 */
export async function createTask(
  db: SQLiteDatabase,
  input: CreateActionItemInput,
): Promise<ActionItem> {
  // Determine date/time based on deadline intent
  let date = input.date;
  let time = input.time;

  if (input.deadlineIntent === "none") {
    date = null;
    time = null;
  } else if (input.deadlineIntent === "date") {
    time = null;
  }
  // 'time' intent keeps both date and time as-is

  // Create the item in DB first (without notification ID)
  const item = await ActionItemsDB.createActionItem(
    db,
    input.text,
    date,
    time,
    input.notes,
  );

  // Schedule notification
  const notificationId = await Scheduler.scheduleTaskNotification(item);
  if (notificationId) {
    await ActionItemsDB.updateActionItem(db, item.id, { notificationId });
    item.notificationId = notificationId;
  }

  return item;
}

/**
 * Toggle task completion.
 * Cancels notification when completing, reschedules when un-completing.
 */
export async function toggleTaskComplete(
  db: SQLiteDatabase,
  taskId: string,
): Promise<void> {
  const task = await ActionItemsDB.getActionItemById(db, taskId);
  if (!task) return;

  const newCompletedAt = await ActionItemsDB.toggleComplete(db, taskId);

  if (newCompletedAt) {
    // Task was completed — cancel any pending notification
    await Scheduler.cancelTaskNotification(task.notificationId);
  } else {
    // Task was un-completed — reschedule notification
    const notificationId = await Scheduler.scheduleTaskNotification({
      ...task,
      completedAt: null,
    });
    await ActionItemsDB.updateActionItem(db, taskId, { notificationId });
  }
}

/**
 * Delete a task and cancel its notification.
 */
export async function deleteTask(
  db: SQLiteDatabase,
  taskId: string,
): Promise<void> {
  const task = await ActionItemsDB.getActionItemById(db, taskId);
  if (task?.notificationId) {
    await Scheduler.cancelTaskNotification(task.notificationId);
  }
  await ActionItemsDB.deleteActionItem(db, taskId);
}

/**
 * Reconcile notifications on app launch.
 */
export async function reconcileOnLaunch(db: SQLiteDatabase): Promise<void> {
  const tasks = await ActionItemsDB.getAllIncompleteTasks(db);
  await Scheduler.reconcileNotifications(
    tasks,
    async (taskId, notificationId) => {
      await ActionItemsDB.updateActionItem(db, taskId, { notificationId });
    },
  );
}
