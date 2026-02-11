import { type SQLiteDatabase } from "expo-sqlite";

// MVP: no migrations table, just CREATE IF NOT EXISTS
// This keeps it simple and idempotent for v1
export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS action_items (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      date TEXT,
      time TEXT,
      notes TEXT,
      notification_id TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS lecture_slots (
      id TEXT PRIMARY KEY,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      subject_code TEXT,
      subject_name TEXT NOT NULL,
      faculty TEXT,
      location TEXT,
      type TEXT NOT NULL DEFAULT 'THEORY',
      batch TEXT
    );
  `);
}
