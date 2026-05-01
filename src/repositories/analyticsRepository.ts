import {MonthlyTotals, CategorySpend, WeeklyTrend, DailyNetFlow} from '../types';
import {BaseRepository} from './BaseRepository';

class AnalyticsRepository extends BaseRepository {
  /**
   * Returns total income, total expense, and net cash flow for a given month.
   */
  async getMonthlyTotals(year: number, month: number): Promise<MonthlyTotals> {
    const result = await this.db.execute(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
       FROM transactions
       WHERE strftime('%Y', date) = ?
         AND strftime('%m', date) = ?
         AND deleted_at IS NULL`,
      [String(year), this.pad(month)],
    );

    const row = this.first<{total_income: number; total_expense: number}>(result);
    const totalIncome = row?.total_income ?? 0;
    const totalExpense = row?.total_expense ?? 0;

    return {
      totalIncome,
      totalExpense,
      netCashFlow: totalIncome - totalExpense,
    };
  }

  /**
   * Returns net cash flow grouped by day for a given month.
   */
  async getDailyNetFlow(year: number, month: number): Promise<DailyNetFlow[]> {
    const result = await this.db.execute(
      `SELECT
         date(date) AS date,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS net_flow
       FROM transactions
       WHERE strftime('%Y', date) = ?
         AND strftime('%m', date) = ?
         AND deleted_at IS NULL
       GROUP BY date(date)
       ORDER BY date(date) ASC`,
      [String(year), this.pad(month)],
    );

    const raw = this.rows<{date: string; net_flow: number}>(result);
    return raw.map(r => ({
      date: r.date,
      netFlow: r.net_flow,
    }));
  }

  /**
   * Returns expense totals per category for a given month, sorted descending.
   */
  async getCategorySpend(year: number, month: number): Promise<CategorySpend[]> {
    const result = await this.db.execute(
      `SELECT
         c.id,
         c.name,
         c.color,
         COALESCE(SUM(t.amount), 0) AS total
       FROM   transactions t
       JOIN   categories   c ON c.id = t.category_id
       WHERE  t.type       = 'expense'
         AND  strftime('%Y', t.date) = ?
         AND  strftime('%m', t.date) = ?
         AND  t.deleted_at IS NULL
       GROUP BY c.id
       ORDER BY total DESC`,
      [String(year), this.pad(month)],
    );

    return this.rows<CategorySpend>(result);
  }

  /**
   * Returns income and expense totals grouped by ISO week within a month.
   */
  async getWeeklyTrend(year: number, month: number): Promise<WeeklyTrend[]> {
    const result = await this.db.execute(
      `SELECT
         strftime('%W', date)                                                    AS week_num,
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
       FROM transactions
       WHERE strftime('%Y', date) = ?
         AND strftime('%m', date) = ?
         AND deleted_at IS NULL
       GROUP BY week_num
       ORDER BY week_num`,
      [String(year), this.pad(month)],
    );

    const raw = this.rows<{week_num: string; income: number; expense: number}>(result);

    return raw.map((r, i) => ({
      weekNum: r.week_num,
      weekLabel: `W${i + 1}`,
      income: r.income,
      expense: r.expense,
    }));
  }

  private pad(month: number): string {
    return String(month).padStart(2, '0');
  }
}

export const analyticsRepository = new AnalyticsRepository();
