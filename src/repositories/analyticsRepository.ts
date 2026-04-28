import {getDb} from '../database/db';
import {QueryResult} from '@op-engineering/op-sqlite';
import {MonthlyTotals, CategorySpend, WeeklyTrend} from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rows<T>(result: QueryResult): T[] {
  return (result.rows as T[]) || [];
}

function pad(month: number): string {
  return String(month).padStart(2, '0');
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Returns total income, total expense, and net cash flow for a given month.
 * A single aggregation pass — no N+1 queries.
 */
export async function getMonthlyTotals(
  year: number,
  month: number,
): Promise<MonthlyTotals> {
  const result = await getDb().execute(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
     FROM transactions
     WHERE strftime('%Y', date) = ?
       AND strftime('%m', date) = ?
       AND deleted_at IS NULL`,
    [String(year), pad(month)],
  );

  const row = rows<{total_income: number; total_expense: number}>(result)[0];
  const totalIncome = row?.total_income ?? 0;
  const totalExpense = row?.total_expense ?? 0;

  return {
    totalIncome,
    totalExpense,
    netCashFlow: totalIncome - totalExpense,
  };
}

/**
 * Returns expense totals per category for a given month, sorted descending.
 * Feeds both the donut chart and the top-spending list.
 */
export async function getCategorySpend(
  year: number,
  month: number,
): Promise<CategorySpend[]> {
  const result = await getDb().execute(
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
    [String(year), pad(month)],
  );

  return rows<CategorySpend>(result);
}

/**
 * Returns income and expense totals grouped by ISO week within a month.
 * The weekLabel is remapped to W1…Wn for clean display.
 */
export async function getWeeklyTrend(
  year: number,
  month: number,
): Promise<WeeklyTrend[]> {
  const result = await getDb().execute(
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
    [String(year), pad(month)],
  );

  const raw = rows<{week_num: string; income: number; expense: number}>(result);

  return raw.map((r, i) => ({
    weekNum: r.week_num,
    weekLabel: `W${i + 1}`,
    income: r.income,
    expense: r.expense,
  }));
}
