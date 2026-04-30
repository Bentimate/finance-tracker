import {getDb, checkpoint} from '../database/db';
import {QueryResult} from '@op-engineering/op-sqlite';
import {Transaction} from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function now(): string {
  return new Date().toISOString();
}

/** Extracts a flat array from an op-sqlite QueryResult. */
function rows<T>(result: QueryResult): T[] {
  return (result.rows as T[]) || [];
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * Returns all active (non-deleted) transactions for a calendar day.
 *
 * @param {string} date  ISO date string 'YYYY-MM-DD'
 */
export async function getTransactionsByDay(date: string): Promise<Transaction[]> {
  const result = await getDb().execute(
    `SELECT t.*, c.name AS category_name, c.color AS category_color
     FROM   transactions t
     JOIN   categories   c ON c.id = t.category_id
     WHERE  date(t.date) = ?
       AND  t.deleted_at IS NULL
     ORDER BY t.date DESC`,
    [date],
  );
  return rows<Transaction>(result);
}

/**
 * Returns all active transactions whose date falls in [startDate, endDate].
 *
 * @param {string} startDate  'YYYY-MM-DD'
 * @param {string} endDate    'YYYY-MM-DD'
 */
export async function getTransactionsByWeek(startDate: string, endDate: string): Promise<Transaction[]> {
  const result = await getDb().execute(
    `SELECT t.*, c.name AS category_name, c.color AS category_color
     FROM   transactions t
     JOIN   categories   c ON c.id = t.category_id
     WHERE  date(t.date) BETWEEN ? AND ?
       AND  t.deleted_at IS NULL
     ORDER BY t.date DESC`,
    [startDate, endDate],
  );
  return rows<Transaction>(result);
}

/**
 * Returns all active transactions for a given year/month.
 */
export async function getTransactionsByMonth(year: number, month: number): Promise<Transaction[]> {
  const result = await getDb().execute(
    `SELECT t.*, c.name AS category_name, c.color AS category_color
     FROM   transactions t
     JOIN   categories   c ON c.id = t.category_id
     WHERE  strftime('%Y', t.date) = ?
       AND  strftime('%m', t.date) = ?
       AND  t.deleted_at IS NULL
     ORDER BY t.date DESC`,
    [String(year), String(month).padStart(2, '0')],
  );
  return rows<Transaction>(result);
}

/**
 * Returns a single active transaction by primary key, or null.
 */
export async function getTransactionById(id: number): Promise<Transaction | null> {
  const result = await getDb().execute(
    `SELECT t.*, c.name AS category_name, c.color AS category_color
     FROM   transactions t
     JOIN   categories   c ON c.id = t.category_id
     WHERE  t.id = ?
       AND  t.deleted_at IS NULL`,
    [id],
  );
  return rows<Transaction>(result)[0] ?? null;
}

/**
 * Returns all active transactions for CSV export (ordered by date ASC).
 */
export async function getTransactionsForExport(year: number, month: number): Promise<Transaction[]> {
  const result = await getDb().execute(
    `SELECT t.*, c.name AS category_name
     FROM   transactions t
     JOIN   categories   c ON c.id = t.category_id
     WHERE  strftime('%Y', t.date) = ?
       AND  strftime('%m', t.date) = ?
       AND  t.deleted_at IS NULL
     ORDER BY t.date ASC`,
    [String(year), String(month).padStart(2, '0')],
  );
  return rows<Transaction>(result);
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

interface CreateTransactionData {
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  date?: string;
  note?: string;
}

/**
 * Inserts a new transaction.
 */
export async function createTransaction({
  amount,
  type,
  category_id,
  date,
  note,
}: CreateTransactionData): Promise<number | undefined> {
  const ts = now();
  const db = getDb();

  await db.execute('BEGIN IMMEDIATE TRANSACTION');

  try {
    const result = await db.execute(
      `INSERT INTO transactions (amount, type, category_id, date, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [amount, type, category_id, date ?? ts, note ?? null, ts, ts],
    );

    await db.execute('COMMIT');
    await checkpoint();

    return result.insertId;
  } catch (e) {
    await db.execute('ROLLBACK');
    throw e;
  }
}

/**
 * Updates mutable fields of an existing transaction.
 */
export async function updateTransaction(
  id: number,
  {amount, type, category_id, date, note}: CreateTransactionData & {date: string},
): Promise<void> {
  const db = getDb();
  await db.execute('BEGIN IMMEDIATE TRANSACTION');

  try {
    await db.execute(
      `UPDATE transactions
       SET    amount = ?, type = ?, category_id = ?, date = ?, note = ?, updated_at = ?
       WHERE  id = ?
         AND  deleted_at IS NULL`,
      [amount, type, category_id, date, note ?? null, now(), id],
    );

    await db.execute('COMMIT');
    await checkpoint();
  } catch (e) {
    await db.execute('ROLLBACK');
    throw e;
  }
}

/**
 * Soft-deletes a transaction by setting deleted_at.
 */
export async function deleteTransaction(id: number): Promise<void> {
  await getDb().execute('UPDATE transactions SET deleted_at = ? WHERE id = ?', [
    now(),
    id,
  ]);
  await checkpoint();
}
