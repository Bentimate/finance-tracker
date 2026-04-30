import {getDb} from '../database/db';
import {QueryResult} from '@op-engineering/op-sqlite';
import {Budget, BudgetProgress} from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rows<T>(result: QueryResult): T[] {
  return (result.rows as T[]) || [];
}

/**
 * Returns the Monday and Sunday (ISO strings) of the week containing `date`.
 */
function currentWeekBounds(date: Date): { startDate: string, endDate: string } {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startDate: monday.toISOString().slice(0, 10),
    endDate: sunday.toISOString().slice(0, 10),
  };
}

/**
 * Returns the first and last day (ISO strings) of the month containing `date`.
 */
function currentMonthBounds(date: Date): { startDate: string, endDate: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  return {
    startDate: first.toISOString().slice(0, 10),
    endDate: last.toISOString().slice(0, 10),
  };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * Returns the budget for one category, or null if none is set.
 */
export async function getBudgetByCategory(categoryId: number): Promise<Budget | null> {
  const result = await getDb().execute(
    `SELECT b.*, c.name AS category_name, c.color AS category_color
     FROM   budgets     b
     JOIN   categories  c ON c.id = b.category_id
     WHERE  b.category_id = ?`,
    [categoryId],
  );
  return rows<Budget>(result)[0] ?? null;
}

/**
 * Returns all budgets for active (non-archived) categories.
 */
export async function getAllBudgets(): Promise<Budget[]> {
  const result = await getDb().execute(
    `SELECT b.*, c.name AS category_name, c.color AS category_color
     FROM   budgets     b
     JOIN   categories  c ON c.id = b.category_id
     WHERE  c.is_archived = 0
     ORDER BY c.name COLLATE NOCASE`,
  );
  return rows<Budget>(result);
}

/**
 * Computes the current-period spend for a category and returns budget progress.
 * Progress is derived from transactions and is never persisted (§3.3, §6).
 */
export async function getBudgetProgress(categoryId: number): Promise<BudgetProgress | null> {
  const budget = await getBudgetByCategory(categoryId);
  if (!budget) {
    return null;
  }

  const today = new Date();
  const {startDate, endDate} =
    budget.period === 'weekly'
      ? currentWeekBounds(today)
      : currentMonthBounds(today);

  const result = await getDb().execute(
    `SELECT COALESCE(SUM(amount), 0) AS spent
     FROM   transactions
     WHERE  category_id = ?
       AND  type = 'expense'
       AND  date(date) BETWEEN ? AND ?
       AND  deleted_at IS NULL`,
    [categoryId, startDate, endDate],
  );

  const spent = (rows<{spent: number}>(result)[0]?.spent) ?? 0;

  return {
    ...budget,
    spent,
    remaining: budget.budget_amount - spent,
    /** 0–100+ — callers may render > 100 as "over budget" */
    percentage: budget.budget_amount > 0 ? (spent / budget.budget_amount) * 100 : 0,
    periodStart: startDate,
    periodEnd: endDate,
  };
}

/**
 * Returns progress for every budgeted, non-archived category.
 */
export async function getAllBudgetProgress(): Promise<BudgetProgress[]> {
  const budgets = await getAllBudgets();
  const progressPromises = budgets.map(b => getBudgetProgress(b.category_id));
  const results = await Promise.all(progressPromises);
  return results.filter((p): p is BudgetProgress => p !== null);
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

interface UpsertBudgetData {
  category_id: number;
  budget_amount: number;
  period: 'weekly' | 'monthly';
}

/**
 * Creates or fully replaces the budget for a category.
 */
export async function upsertBudget({
  category_id,
  budget_amount,
  period,
}: UpsertBudgetData): Promise<void> {
  const db = getDb();
  await db.execute('BEGIN IMMEDIATE TRANSACTION');

  try {
    await db.execute(
      `INSERT INTO budgets (category_id, budget_amount, period)
       VALUES (?, ?, ?)
       ON CONFLICT (category_id)
       DO UPDATE SET budget_amount = excluded.budget_amount,
                     period        = excluded.period`,
      [category_id, budget_amount, period],
    );

    await db.execute('COMMIT');
  } catch (e) {
    await db.execute('ROLLBACK');
    throw e;
  }
}

/**
 * Removes the budget definition for a category.
 */
export async function deleteBudget(categoryId: number): Promise<void> {
  await getDb().execute('DELETE FROM budgets WHERE category_id = ?', [
    categoryId,
  ]);
}
