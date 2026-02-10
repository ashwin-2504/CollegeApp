import * as SQLite from "expo-sqlite";

export let db: SQLite.SQLiteDatabase;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync("check.db");
    await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS actions (
                id TEXT PRIMARY KEY NOT NULL,
                text TEXT NOT NULL,
                date TEXT,
                time TEXT,
                notes TEXT,
                createdAt TEXT NOT NULL,
                completedAt TEXT,
                notificationId TEXT
            );
            CREATE TABLE IF NOT EXISTS timetable (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dayOfWeek INTEGER NOT NULL,
                startTime TEXT NOT NULL,
                endTime TEXT NOT NULL,
                subjectCode TEXT,
                subjectName TEXT,
                faculty TEXT,
                location TEXT,
                type TEXT NOT NULL
            );
        `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
};
