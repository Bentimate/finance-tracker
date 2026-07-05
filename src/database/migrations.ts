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

        // --- Fix transactions table ---
        db.execute('ALTER TABLE transactions RENAME TO transactions_v1');
        db.execute(`
          CREATE TABLE transactions (
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
          INSERT INTO transactions (id, amount, type, date, category_id, note, created_at, updated_at, deleted_at)
          SELECT                    id, amount, type, date, category_id, note, created_at, updated_at, deleted_at
          FROM transactions_v1
        `);
        db.execute('DROP TABLE transactions_v1');

        // --- Fix budgets table ---
        db.execute('ALTER TABLE budgets RENAME TO budgets_v1');
        db.execute(`
          CREATE TABLE budgets (
            category_id   INTEGER PRIMARY KEY REFERENCES categories (id),
            budget_amount REAL    NOT NULL CHECK (budget_amount > 0),
            period        TEXT    NOT NULL CHECK (period IN ('weekly', 'monthly'))
          )
        `);
        db.execute(`
          INSERT INTO budgets (category_id, budget_amount, period)
          SELECT                category_id, budget_amount, period
          FROM budgets_v1
        `);
        db.execute('DROP TABLE budgets_v1');
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

  {
    version: 3,
    up(db: DB) {
      db.execute(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          key   TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

      // Initialise with default settings
      const defaultSettings = JSON.stringify({
        pay_cycle_day: null,
        transaction_scope_account_id: null,
        widget_account_id: null,
      });

      db.execute(
        'INSERT OR IGNORE INTO user_preferences (key, value) VALUES (?, ?)',
        ['global_settings', defaultSettings],
      );
    },
  },

  {
    version: 4,
    up(db: DB) {
      db.execute(`
        CREATE TABLE IF NOT EXISTS recurring_transactions (
          id              INTEGER PRIMARY KEY AUTOINCREMENT,
          amount          REAL    NOT NULL CHECK (amount > 0),
          type            TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
          category_id     INTEGER NOT NULL REFERENCES categories (id),
          note            TEXT,
          frequency       TEXT    NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
          interval_value  INTEGER,
          next_occurrence TEXT    NOT NULL,
          is_active       INTEGER NOT NULL DEFAULT 1,
          created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          updated_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          deleted_at      TEXT
        )
      `);

      db.execute('ALTER TABLE transactions ADD COLUMN recurring_transaction_id INTEGER REFERENCES recurring_transactions (id)');
      db.execute('ALTER TABLE transactions ADD COLUMN recurring_occurrence_date TEXT');

      db.execute(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_txn_recurring_occurrence
          ON transactions (recurring_transaction_id, recurring_occurrence_date)
          WHERE recurring_transaction_id IS NOT NULL
      `);

      db.execute(
        'CREATE INDEX IF NOT EXISTS idx_recurring_next_occurrence ON recurring_transactions (next_occurrence)',
      );
      db.execute(
        'CREATE INDEX IF NOT EXISTS idx_recurring_category ON recurring_transactions (category_id)',
      );
    },
  },

  {
    version: 5,
    up(db: DB) {
      db.execute(`
        CREATE TABLE IF NOT EXISTS accounts (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          name        TEXT NOT NULL,
          is_default  INTEGER NOT NULL DEFAULT 0,
          created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          deleted_at  TEXT
        )
      `);

      db.execute(`
        INSERT INTO accounts (id, name, is_default, created_at, updated_at)
        SELECT 1, 'Main', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE id = 1)
      `);

      db.execute('ALTER TABLE transactions ADD COLUMN account_id INTEGER REFERENCES accounts (id) NOT NULL DEFAULT 1');
      db.execute('ALTER TABLE recurring_transactions ADD COLUMN account_id INTEGER REFERENCES accounts (id) NOT NULL DEFAULT 1');

      db.execute(`
        CREATE TABLE IF NOT EXISTS account_transfers (
          id              INTEGER PRIMARY KEY AUTOINCREMENT,
          from_account_id  INTEGER NOT NULL REFERENCES accounts (id),
          to_account_id    INTEGER NOT NULL REFERENCES accounts (id),
          amount          REAL    NOT NULL CHECK (amount > 0),
          note            TEXT,
          created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          updated_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          deleted_at      TEXT
        )
      `);

      db.execute(`
        CREATE INDEX IF NOT EXISTS idx_accounts_default
          ON accounts (is_default)
      `);
      db.execute(`
        CREATE INDEX IF NOT EXISTS idx_txn_account
          ON transactions (account_id)
      `);
      db.execute(`
        CREATE INDEX IF NOT EXISTS idx_recurring_account
          ON recurring_transactions (account_id)
      `);
      db.execute(`
        CREATE INDEX IF NOT EXISTS idx_transfers_from_account
          ON account_transfers (from_account_id)
      `);
      db.execute(`
        CREATE INDEX IF NOT EXISTS idx_transfers_to_account
          ON account_transfers (to_account_id)
      `);
    },
  },

  {
    version: 6,
    up(db: DB) {
      db.execute('ALTER TABLE accounts ADD COLUMN current_balance REAL NOT NULL DEFAULT 0');

      db.execute(`
        WITH balance_totals AS (
          SELECT a.id AS account_id,
                 COALESCE((
                   SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
                   FROM transactions
                   WHERE deleted_at IS NULL
                     AND account_id = a.id
                 ), 0)
                 +
                 COALESCE((
                   SELECT COALESCE(SUM(delta), 0)
                   FROM (
                     SELECT amount AS delta
                     FROM account_transfers
                     WHERE deleted_at IS NULL
                       AND to_account_id = a.id
                     UNION ALL
                     SELECT -amount AS delta
                     FROM account_transfers
                     WHERE deleted_at IS NULL
                       AND from_account_id = a.id
                   )
                 ), 0) AS balance
          FROM accounts a
          WHERE a.deleted_at IS NULL
        )
        UPDATE accounts
        SET current_balance = COALESCE((SELECT balance FROM balance_totals WHERE balance_totals.account_id = accounts.id), 0)
      `);
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
