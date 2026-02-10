import { SQLiteDatabase } from 'expo-sqlite';

const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY NOT NULL
  );

  CREATE TABLE IF NOT EXISTS action_items (
    id TEXT PRIMARY KEY NOT NULL,
    text TEXT NOT NULL,
    date TEXT,
    time TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    completed_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_action_items_schedule
    ON action_items(date, time, created_at, id);

  CREATE TABLE IF NOT EXISTS timetable_metadata (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
    semester_locked INTEGER NOT NULL DEFAULT 0,
    class_name TEXT,
    division TEXT,
    batch TEXT,
    setup_timestamp TEXT,
    locked_at TEXT
  );

  CREATE TABLE IF NOT EXISTS lecture_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timetable_id INTEGER NOT NULL DEFAULT 1,
    day_of_week TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    faculty TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    batch TEXT,
    sort_order INTEGER NOT NULL,
    FOREIGN KEY (timetable_id) REFERENCES timetable_metadata(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_lecture_slots_runtime
    ON lecture_slots(day_of_week, start_time, end_time, sort_order, id);

  INSERT OR IGNORE INTO timetable_metadata (
    id,
    semester_locked,
    class_name,
    division,
    batch,
    setup_timestamp,
    locked_at
  ) VALUES (1, 0, NULL, NULL, NULL, NULL, NULL);
  `,
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('BEGIN;');
  try {
    await db.execAsync('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY NOT NULL);');
    const row = await db.getFirstAsync<{ version: number }>(
      'SELECT MAX(version) AS version FROM schema_migrations',
    );

    const currentVersion = Number(row?.version ?? 0);

    for (let index = currentVersion; index < MIGRATIONS.length; index += 1) {
      const nextVersion = index + 1;
      await db.execAsync(MIGRATIONS[index]);
      await db.runAsync('INSERT INTO schema_migrations (version) VALUES (?);', nextVersion);
    }

    await db.execAsync('COMMIT;');
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }
}
