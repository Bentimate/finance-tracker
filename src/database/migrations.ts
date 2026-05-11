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

      // Initialise db with common categories
      db.execute(`
          INSERT INTO categories (name, color) VALUES
          ('Food', '#f59e0b'),
          ('Transport', '#64748b')
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

  {
    version: 2,
    up(db: DB) {
      // SQLite cannot drop or modify an existing constraint, so we recreate the
      // categories table to:
      //   1. Replace the global UNIQUE(name COLLATE NOCASE) constraint with two
      //      partial unique indexes (per-scope uniqueness for nested categories).
      //   2. Add the nullable `parent_id` column (null = root category).
      //   3. Add the nullable `icon` column (MaterialCommunityIcons name string).
      //
      // PRAGMA foreign_keys must be OFF during the rename/recreate/copy/drop
      // sequence because transactions and budgets FK-reference categories(id).
      // This pragma cannot be set inside a transaction, so it is set here at
      // the connection level and restored immediately after the table swap.

      db.execute('PRAGMA foreign_keys = OFF');

      try {
        // Step 1 — preserve existing rows under a temporary name
        db.execute('ALTER TABLE categories RENAME TO categories_v1');

        // Step 2 — create the new table (no inline UNIQUE constraint)
        db.execute(`
          CREATE TABLE categories (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            color       TEXT    NOT NULL DEFAULT '#6366f1',
            icon        TEXT,
            parent_id   INTEGER REFERENCES categories (id),
            is_archived INTEGER NOT NULL DEFAULT 0
          )
        `);

        // Step 3 — copy all existing rows; new columns default to NULL
        db.execute(`
          INSERT INTO categories (id, name, color, icon, parent_id, is_archived)
          SELECT id, name, color, NULL, NULL, is_archived
          FROM categories_v1
        `);

        // Step 4 — remove the temporary table
        db.execute('DROP TABLE categories_v1');
      } finally {
        // Always restore FK enforcement, even if something above throws
        db.execute('PRAGMA foreign_keys = ON');
      }

      // Replace the old global uniqueness constraint with two partial indexes:
      //
      //   Root categories  → unique name among all roots (parent_id IS NULL)
      //   Child categories → unique name within the same parent (parent_id IS NOT NULL)
      //
      // This allows e.g. "Food > Breakfast" and "Drinks > Breakfast" to coexist
      // while still preventing two roots both named "Food".
      db.execute(`
        CREATE UNIQUE INDEX idx_cat_name_root
          ON categories (name COLLATE NOCASE)
          WHERE parent_id IS NULL
      `);

      db.execute(`
        CREATE UNIQUE INDEX idx_cat_name_child
          ON categories (name COLLATE NOCASE, parent_id)
          WHERE parent_id IS NOT NULL
      `);

      // Index to make child lookups fast (e.g. fetching all children of a parent)
      db.execute(
        'CREATE INDEX IF NOT EXISTS idx_cat_parent ON categories (parent_id)',
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