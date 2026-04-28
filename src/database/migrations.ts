import {DB} from '@op-engineering/op-sqlite';

/**
 * Versioned migrations. Add new objects to the MIGRATIONS array to evolve
 * the schema without wiping data. Each migration runs exactly once per device.
 */

interface Migration {
  version: number;
  up: (db: DB) => Promise<void> | void;
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up(db: DB) {
      // Categories must exist before transactions (FK dependency)
      db.execute(`
        CREATE TABLE IF NOT EXISTS categories (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          name        TEXT    NOT NULL,
          color       TEXT    NOT NULL DEFAULT '#6366f1',
          is_archived INTEGER NOT NULL DEFAULT 0,
          UNIQUE (name COLLATE NOCASE)
        )
      `);

      db.execute(`
        CREATE TABLE IF NOT EXISTS transactions (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          amount      REAL    NOT NULL CHECK (amount > 0),
          type        TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
          date        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          category_id INTEGER NOT NULL REFERENCES categories (id),
          note        TEXT,
          created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          deleted_at  TEXT
        )
      `);

      db.execute(`
        CREATE TABLE IF NOT EXISTS budgets (
          category_id   INTEGER PRIMARY KEY REFERENCES categories (id),
          budget_amount REAL    NOT NULL CHECK (budget_amount > 0),
          period        TEXT    NOT NULL CHECK (period IN ('weekly', 'monthly'))
        )
      `);

      // Indexes to keep list queries fast per §5.1
      db.execute(
        'CREATE INDEX IF NOT EXISTS idx_txn_date     ON transactions (date)',
      );
      db.execute(
        'CREATE INDEX IF NOT EXISTS idx_txn_category ON transactions (category_id)',
      );
      db.execute(
        'CREATE INDEX IF NOT EXISTS idx_txn_deleted  ON transactions (deleted_at)',
      );
    },
  },
];

/**
 * Runs any pending migrations against the supplied DB connection.
 * Safe to call every startup – already-applied migrations are skipped.
 */
export async function runMigrations(db: DB): Promise<void> {
  // Bootstrap: a meta table tracks the applied schema version.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS _meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  const result = await db.execute(
    "SELECT value FROM _meta WHERE key = 'schema_version'",
  );

  let currentVersion = 0;
  const data = result.rows || [];
  if (data.length > 0) {
    currentVersion = parseInt((data[0] as any).value, 10);
  }

  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      await migration.up(db);
      await db.execute(
        "INSERT OR REPLACE INTO _meta (key, value) VALUES ('schema_version', ?)",
        [String(migration.version)],
      );
      currentVersion = migration.version;
    }
  }
}
