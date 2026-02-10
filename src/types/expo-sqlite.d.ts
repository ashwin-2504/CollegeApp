declare module 'expo-sqlite' {
  export interface SQLiteRunResult {
    changes: number;
    lastInsertRowId: number;
  }

  export interface SQLiteDatabase {
    execAsync(source: string): Promise<void>;
    runAsync(source: string, ...params: unknown[]): Promise<SQLiteRunResult>;
    getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]>;
    getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null>;
  }

  export function openDatabaseAsync(name: string): Promise<SQLiteDatabase>;
}
