import { runMigrations } from './migrations';
import { getDatabase } from './sqlite';

export async function initializeOfflineStorage(): Promise<void> {
  const db = await getDatabase();
  await runMigrations(db);
}
