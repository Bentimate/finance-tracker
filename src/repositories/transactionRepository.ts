import {Transaction} from '../types';
import {BaseRepository} from './BaseRepository';

export interface CreateTransactionData {
  amount: number;
  type: 'income' | 'expense';
  account_id: number;
  category_id: number;
  date?: string;
  note?: string;
}

/**
 * SELECT clause shared by all read queries.
 *
 * Joins the category row for display fields, then left-joins the parent row
 * so that `category_parent_name` is populated for child categories and NULL
 * for standalone (root) categories.
 *
 * Callers render the display name as:
 *   - category_parent_name present → `${category_parent_name} > ${category_name}`
 *   - category_parent_name absent  → `${category_name}`
 */
const SELECT_WITH_CATEGORY = `
  SELECT t.*,
         c.name  AS category_name,
         c.color AS category_color,
         c.icon  AS category_icon,
         p.name  AS category_parent_name
  FROM   transactions t
  JOIN   categories   c ON c.id = t.category_id
  LEFT JOIN categories p ON p.id = c.parent_id
`;

function buildAccountWhere(accountId?: number): {sql: string; params: number[]} {
  if (!accountId) {
    return {sql: '', params: []};
  }
  return {sql: ' AND account_id = ?', params: [accountId]};
}

class TransactionRepository extends BaseRepository {
  /**
   * Returns all active (non-deleted) transactions for a calendar day.
   * @param {string} date ISO date string 'YYYY-MM-DD'
   */
  async getByDay(date: string, accountId?: number): Promise<Transaction[]> {
    const accountFilter = buildAccountWhere(accountId);
    const result = await this.db.execute(
      `${SELECT_WITH_CATEGORY}
       WHERE  date(t.date, 'localtime') = ?
         AND  t.deleted_at IS NULL
         ${accountFilter.sql}
       ORDER BY t.date DESC`,
      [date, ...accountFilter.params],
    );
    return this.rows<Transaction>(result);
  }

  /**
   * Returns all active transactions whose date falls in [startDate, endDate].
   * @param {string} startDate 'YYYY-MM-DD'
   * @param {string} endDate 'YYYY-MM-DD'
   */
  async getByWeek(startDate: string, endDate: string, accountId?: number): Promise<Transaction[]> {
    const accountFilter = buildAccountWhere(accountId);
    const result = await this.db.execute(
      `${SELECT_WITH_CATEGORY}
       WHERE  date(t.date, 'localtime') BETWEEN ? AND ?
         AND  t.deleted_at IS NULL
         ${accountFilter.sql}
       ORDER BY t.date DESC`,
      [startDate, endDate, ...accountFilter.params],
    );
    return this.rows<Transaction>(result);
  }

  /**
   * Returns all active transactions for a given year/month.
   */
  async getByMonth(year: number, month: number, accountId?: number): Promise<Transaction[]> {
    const accountFilter = buildAccountWhere(accountId);
    const result = await this.db.execute(
      `${SELECT_WITH_CATEGORY}
       WHERE  strftime('%Y', t.date, 'localtime') = ?
         AND  strftime('%m', t.date, 'localtime') = ?
         AND  t.deleted_at IS NULL
         ${accountFilter.sql}
       ORDER BY t.date DESC`,
      [String(year), String(month).padStart(2, '0'), ...accountFilter.params],
    );
    return this.rows<Transaction>(result);
  }

  /**
   * Returns a single active transaction by primary key, or null.
   */
  async getById(id: number): Promise<Transaction | null> {
    const result = await this.db.execute(
      `${SELECT_WITH_CATEGORY}
       WHERE  t.id = ?
         AND  t.deleted_at IS NULL`,
      [id],
    );
    return this.first<Transaction>(result);
  }

  /**
   * Returns all active transactions for CSV export (ordered by date ASC).
   */
  async getForExport(year: number, month: number, accountId?: number): Promise<Transaction[]> {
    const accountFilter = buildAccountWhere(accountId);
    const result = await this.db.execute(
      `${SELECT_WITH_CATEGORY}
       WHERE  strftime('%Y', t.date, 'localtime') = ?
         AND  strftime('%m', t.date, 'localtime') = ?
         AND  t.deleted_at IS NULL
         ${accountFilter.sql}
       ORDER BY t.date ASC`,
      [String(year), String(month).padStart(2, '0'), ...accountFilter.params],
    );
    return this.rows<Transaction>(result);
  }

  /**
   * Inserts a new transaction.
   */
  async create({
    amount,
    type,
    account_id,
    category_id,
    date,
    note,
  }: CreateTransactionData): Promise<number | undefined> {
    const ts = this.now();

    return this.withTransaction(async () => {
      const result = await this.db.execute(
        `INSERT INTO transactions (amount, type, account_id, category_id, date, note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [amount, type, account_id, category_id, date ?? ts, note ?? null, ts, ts],
      );
      return result.insertId;
    });
  }

  /**
   * Updates mutable fields of an existing transaction.
   */
  async update(
    id: number,
    {amount, type, account_id, category_id, date, note}: CreateTransactionData & {date: string},
  ): Promise<void> {
    await this.withTransaction(async () => {
      await this.db.execute(
        `UPDATE transactions
         SET    amount = ?, type = ?, account_id = ?, category_id = ?, date = ?, note = ?, updated_at = ?
         WHERE  id = ?
           AND  deleted_at IS NULL`,
        [amount, type, account_id, category_id, date, note ?? null, this.now(), id],
      );
    });
  }

  async getEarliestYear(accountId?: number): Promise<number> {
    const accountFilter = buildAccountWhere(accountId);
    const result = await this.db.execute(
      `SELECT strftime("%Y", MIN(date)) as year
       FROM transactions
       WHERE deleted_at IS NULL
       ${accountFilter.sql}`,
      accountFilter.params,
    );
    const row = this.first<{year: string}>(result);
    return row?.year ? parseInt(row.year, 10) : new Date().getFullYear();
  }

  /**
   * Soft-deletes a transaction by setting deleted_at.
   */
  async delete(id: number): Promise<void> {
    await this.db.execute('UPDATE transactions SET deleted_at = ? WHERE id = ?', [
      this.now(),
      id,
    ]);
  }

  /**
   * Returns the year of the earliest transaction in the database.
   * Returns current year if no transactions exist.
   */
}

export const transactionRepository = new TransactionRepository();
