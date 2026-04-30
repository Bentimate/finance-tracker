import {open, DB} from '@op-engineering/op-sqlite';
import RNFS from 'react-native-fs';
import {runMigrations} from './migrations';

let _db: DB | null = null;
let _initPromise: Promise<void> | null = null;

const INITIALIZED_FLAG_PATH = `${RNFS.DocumentDirectoryPath}/.db_initialized`;

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
 * Manually flushes the Write-Ahead Log (WAL) into the main database file.
 * (Now a no-op as we switched to DELETE mode for multi-engine compatibility).
 */
export async function checkpoint(): Promise<void> {
  // No-op in DELETE mode.
}

/**
 * Opens the SQLite database and applies any pending schema migrations.
 * Call once at app startup (App.js) before rendering any screens.
 */
export async function initDb(): Promise<void> {
  if (_db) {
    return;
  }

  if (_initPromise) {
    return _initPromise;
  }

  _initPromise = (async () => {
    // 1. Mark as NOT initialized while migrations run.
    try {
      if (await RNFS.exists(INITIALIZED_FLAG_PATH)) {
        await RNFS.unlink(INITIALIZED_FLAG_PATH);
      }
    } catch (e) {}

    _db = open({name: 'finance_tracker.db'});

    // Enable foreign-key enforcement
    await _db.execute('PRAGMA foreign_keys = ON');

    // Use DELETE journal mode instead of WAL.
    // This is much safer when sharing the same database file between two
    // different SQLite engines (the JS op-sqlite bundled engine and the
    // Android system native engine used by the widget).
    await _db.execute('PRAGMA journal_mode = DELETE');

    // Wait up to 5s if the database is locked by another process (like the widget)
    await _db.execute('PRAGMA busy_timeout = 5000');

    // Ensure transactions are durable
    await _db.execute('PRAGMA synchronous = FULL');

    await runMigrations(_db);

    // 2. Signal that DB is ready for native side
    try {
      await RNFS.writeFile(INITIALIZED_FLAG_PATH, 'ready', 'utf8');
    } catch (e) {
      console.error('Failed to write DB sentinel:', e);
    }
  })();

  return _initPromise;
}
