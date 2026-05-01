import {Transaction} from '../types';
import {BaseRepository} from './BaseRepository';

export interface CreateTransactionData {
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  date?: string;
  note?: string;
}

class TransactionRepository extends BaseRepository {
  /**
   * Returns all active (non-deleted) transactions for a calendar day.
   * @param {string} date ISO date string 'YYYY-MM-DD'
   */
  async getByDay(date: string): Promise<Transaction[]> {
    const result = await this.db.execute(
      `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM   transactions t
       JOIN   categories   c ON c.id = t.category_id
       WHERE  date(t.date) = ?
         AND  t.deleted_at IS NULL
       ORDER BY t.date DESC`,
      [date],
    );
    return this.rows<Transaction>(result);
  }

  /**
   * Returns all active transactions whose date falls in [startDate, endDate].
   * @param {string} startDate 'YYYY-MM-DD'
   * @param {string} endDate 'YYYY-MM-DD'
   */
  async getByWeek(startDate: string, endDate: string): Promise<Transaction[]> {
    const result = await this.db.execute(
      `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM   transactions t
       JOIN   categories   c ON c.id = t.category_id
       WHERE  date(t.date) BETWEEN ? AND ?
         AND  t.deleted_at IS NULL
       ORDER BY t.date DESC`,
      [startDate, endDate],
    );
    return this.rows<Transaction>(result);
  }

  /**
   * Returns all active transactions for a given year/month.
   */
  async getByMonth(year: number, month: number): Promise<Transaction[]> {
    const result = await this.db.execute(
      `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM   transactions t
       JOIN   categories   c ON c.id = t.category_id
       WHERE  strftime('%Y', t.date) = ?
         AND  strftime('%m', t.date) = ?
         AND  t.deleted_at IS NULL
       ORDER BY t.date DESC`,
      [String(year), String(month).padStart(2, '0')],
    );
    return this.rows<Transaction>(result);
  }

  /**
   * Returns a single active transaction by primary key, or null.
   */
  async getById(id: number): Promise<Transaction | null> {
    const result = await this.db.execute(
      `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM   transactions t
       JOIN   categories   c ON c.id = t.category_id
       WHERE  t.id = ?
         AND  t.deleted_at IS NULL`,
      [id],
    );
    return this.first<Transaction>(result);
  }

  /**
   * Returns all active transactions for CSV export (ordered by date ASC).
   */
  async getForExport(year: number, month: number): Promise<Transaction[]> {
    const result = await this.db.execute(
      `SELECT t.*, c.name AS category_name
       FROM   transactions t
       JOIN   categories   c ON c.id = t.category_id
       WHERE  strftime('%Y', t.date) = ?
         AND  strftime('%m', t.date) = ?
         AND  t.deleted_at IS NULL
       ORDER BY t.date ASC`,
      [String(year), String(month).padStart(2, '0')],
    );
    return this.rows<Transaction>(result);
  }

  /**
   * Inserts a new transaction.
   */
  async create({
    amount,
    type,
    category_id,
    date,
    note,
  }: CreateTransactionData): Promise<number | undefined> {
    const ts = this.now();

    return this.withTransaction(async () => {
      const result = await this.db.execute(
        `INSERT INTO transactions (amount, type, category_id, date, note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [amount, type, category_id, date ?? ts, note ?? null, ts, ts],
      );
      return result.insertId;
    });
  }

  /**
   * Updates mutable fields of an existing transaction.
   */
  async update(
    id: number,
    {amount, type, category_id, date, note}: CreateTransactionData & {date: string},
  ): Promise<void> {
    await this.withTransaction(async () => {
      await this.db.execute(
        `UPDATE transactions
         SET    amount = ?, type = ?, category_id = ?, date = ?, note = ?, updated_at = ?
         WHERE  id = ?
           AND  deleted_at IS NULL`,
        [amount, type, category_id, date, note ?? null, this.now(), id],
      );
    });
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
}

export const transactionRepository = new TransactionRepository();
