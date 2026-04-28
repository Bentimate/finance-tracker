import {open, DB} from '@op-engineering/op-sqlite';
import {runMigrations} from './migrations';

let _db: DB | null = null;

/**
 * Returns the open DB connection.
 * Throws if called before initDb().
 */
export function getDb(): DB {
  if (!_db) {
    throw new Error(
      'Database not initialised. Await initDb() before accessing the DB.',
    );
  }
  return _db;
}

/**
 * Opens the SQLite database and applies any pending schema migrations.
 * Call once at app startup (App.js) before rendering any screens.
 */
export async function initDb(): Promise<void> {
  _db = open({name: 'finance_tracker.db'});

  // Enable foreign-key enforcement (off by default in SQLite)
  await _db.execute('PRAGMA foreign_keys = ON');

  // WAL mode for better concurrent read performance and atomic writes (§5.2)
  await _db.execute('PRAGMA journal_mode = WAL');

  await runMigrations(_db);
}
