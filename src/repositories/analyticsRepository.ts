import {MonthlyTotals, CategorySpend, WeeklyTrend, DailyNetFlow} from '../types';
import {BaseRepository} from './BaseRepository';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParentCategoryOption {
  id: number;
  name: string;
  color: string;
  icon: string | null;
}

export interface ChildCategorySpendResult {
  children: CategorySpend[];
  othersTotal: number;
}

/**
 * Inclusive date range passed to all dashboard queries.
 * Both values are 'YYYY-MM-DD' strings.
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

// ---------------------------------------------------------------------------
// Helpers (exported so DashboardScreen and useDashboardData can build ranges)
// ---------------------------------------------------------------------------

/**
 * Builds a DateRange for a single calendar month.
 */
export function monthRange(year: number, month: number): DateRange {
  const start = `${String(year)}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${String(year)}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return {startDate: start, endDate: end};
}

/**
 * Builds a DateRange spanning from the first day of startMonth
 * to the last day of endMonth.
 */
export function customRange(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number,
): DateRange {
  const start = `${String(startYear)}-${String(startMonth).padStart(2, '0')}-01`;
  const lastDay = new Date(endYear, endMonth, 0).getDate();
  const end = `${String(endYear)}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return {startDate: start, endDate: end};
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

class AnalyticsRepository extends BaseRepository {
  /**
   * Returns total income, total expense, and net cash flow for a date range.
   */
  async getMonthlyTotals(range: DateRange): Promise<MonthlyTotals> {
    const result = await this.db.execute(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
       FROM transactions
       WHERE date(date, 'localtime') BETWEEN ? AND ?
         AND deleted_at IS NULL`,
      [range.startDate, range.endDate],
    );

    const row = this.first<{total_income: number; total_expense: number}>(result);
    const totalIncome = row?.total_income ?? 0;
    const totalExpense = row?.total_expense ?? 0;

    return {totalIncome, totalExpense, netCashFlow: totalIncome - totalExpense};
  }

  /**
   * Returns net cash flow grouped by day for a single calendar month.
   * Intentionally keeps year/month params since CalendarView uses this directly.
   */
  async getDailyNetFlow(year: number, month: number): Promise<DailyNetFlow[]> {
    const range = monthRange(year, month);
    const result = await this.db.execute(
      `SELECT
         date(date, 'localtime') AS date,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS net_flow
       FROM transactions
       WHERE date(date, 'localtime') BETWEEN ? AND ?
         AND deleted_at IS NULL
       GROUP BY date(date, 'localtime')
       ORDER BY date(date, 'localtime') ASC`,
      [range.startDate, range.endDate],
    );

    const raw = this.rows<{date: string; net_flow: number}>(result);
    return raw.map(r => ({date: r.date, netFlow: r.net_flow}));
  }

  /**
   * Returns expense totals per category for a date range, sorted descending.
   */
  async getCategorySpend(range: DateRange): Promise<CategorySpend[]> {
    const result = await this.db.execute(
      `SELECT
         c.id,
         c.name,
         c.color,
         COALESCE(SUM(t.amount), 0) AS total
       FROM   transactions t
       JOIN   categories   c ON c.id = t.category_id
       WHERE  t.type       = 'expense'
         AND  date(t.date, 'localtime') BETWEEN ? AND ?
         AND  t.deleted_at IS NULL
       GROUP BY c.id
       ORDER BY total DESC`,
      [range.startDate, range.endDate],
    );

    return this.rows<CategorySpend>(result);
  }

  /**
   * Returns income and expense totals grouped by ISO week within a date range.
   */
  async getWeeklyTrend(range: DateRange): Promise<WeeklyTrend[]> {
    const result = await this.db.execute(
      `SELECT
         strftime('%W', date, 'localtime') AS week_num,
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
       FROM transactions
       WHERE date(date, 'localtime') BETWEEN ? AND ?
         AND deleted_at IS NULL
       GROUP BY week_num
       ORDER BY week_num`,
      [range.startDate, range.endDate],
    );

    const raw = this.rows<{week_num: string; income: number; expense: number}>(result);

    return raw.map((r, i) => ({
      weekNum: r.week_num,
      weekLabel: `W${i + 1}`,
      income: r.income,
      expense: r.expense,
    }));
  }

  /**
   * Returns expense totals grouped by top-level parent category for a date range.
   * Child transactions are rolled up into their parent's total.
   * Standalone categories appear as their own slice.
   */
  async getParentCategorySpend(range: DateRange): Promise<CategorySpend[]> {
    const result = await this.db.execute(
      `SELECT
         COALESCE(c.parent_id, c.id)    AS id,
         COALESCE(p.name,  c.name)      AS name,
         COALESCE(p.color, c.color)     AS color,
         COALESCE(SUM(t.amount), 0)     AS total
       FROM   transactions t
       JOIN   categories   c ON c.id       = t.category_id
       LEFT JOIN categories p ON p.id       = c.parent_id
       WHERE  t.type       = 'expense'
         AND  date(t.date, 'localtime') BETWEEN ? AND ?
         AND  t.deleted_at IS NULL
       GROUP BY COALESCE(c.parent_id, c.id)
       ORDER BY total DESC`,
      [range.startDate, range.endDate],
    );

    return this.rows<CategorySpend>(result);
  }

  /**
   * Returns per-child expense totals for a given parent category over a date
   * range, plus the total of transactions assigned directly to the parent
   * (the "Others" bucket).
   */
  async getChildCategorySpend(
    parentId: number,
    range: DateRange,
  ): Promise<ChildCategorySpendResult> {
    const childResult = await this.db.execute(
      `SELECT
         c.id,
         c.name,
         c.color,
         COALESCE(SUM(t.amount), 0) AS total
       FROM   transactions t
       JOIN   categories   c ON c.id = t.category_id
       WHERE  t.type       = 'expense'
         AND  c.parent_id  = ?
         AND  date(t.date, 'localtime') BETWEEN ? AND ?
         AND  t.deleted_at IS NULL
       GROUP BY c.id
       ORDER BY total DESC`,
      [parentId, range.startDate, range.endDate],
    );

    const othersResult = await this.db.execute(
      `SELECT COALESCE(SUM(amount), 0) AS others_total
       FROM   transactions
       WHERE  type        = 'expense'
         AND  category_id = ?
         AND  date(date, 'localtime') BETWEEN ? AND ?
         AND  deleted_at IS NULL`,
      [parentId, range.startDate, range.endDate],
    );

    const children = this.rows<CategorySpend>(childResult);
    const othersRow = this.first<{others_total: number}>(othersResult);
    const othersTotal = othersRow?.others_total ?? 0;

    return {children, othersTotal};
  }

  /**
   * Returns parent categories that have expense transactions in the given
   * date range and have at least one non-archived child.
   */
  async getDonutParentOptions(range: DateRange): Promise<ParentCategoryOption[]> {
    const result = await this.db.execute(
      `SELECT p.id, p.name, p.color, p.icon
       FROM   categories p
       WHERE  p.parent_id  IS NULL
         AND  p.is_archived = 0
         AND  EXISTS (
               SELECT 1 FROM categories c
               WHERE  c.parent_id  = p.id
                 AND  c.is_archived = 0
             )
         AND  EXISTS (
               SELECT 1
               FROM   transactions t
               JOIN   categories   c2 ON c2.id = t.category_id
               WHERE  (c2.id = p.id OR c2.parent_id = p.id)
                 AND  t.type       = 'expense'
                 AND  date(t.date, 'localtime') BETWEEN ? AND ?
                 AND  t.deleted_at IS NULL
             )
       ORDER BY p.name`,
      [range.startDate, range.endDate],
    );

    return this.rows<ParentCategoryOption>(result);
  }

  /**
   * Returns the year of the earliest transaction in the database.
   * Returns current year if no transactions exist.
   */
  async getEarliestYear(): Promise<number> {
    const result = await this.db.execute(
      'SELECT strftime("%Y", MIN(date)) as year FROM transactions WHERE deleted_at IS NULL',
    );
    const row = this.first<{year: string}>(result);
    return row?.year ? parseInt(row.year, 10) : new Date().getFullYear();
  }
}

export const analyticsRepository = new AnalyticsRepository();