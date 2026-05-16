import {Budget, BudgetProgress} from '../types';
import {BaseRepository} from './BaseRepository';

export interface UpsertBudgetData {
  category_id: number;
  budget_amount: number;
  period: 'weekly' | 'monthly';
}

class BudgetRepository extends BaseRepository {
  /**
   * Returns the budget for one category, or null if none is set.
   */
  async getByCategory(categoryId: number): Promise<Budget | null> {
    const result = await this.db.execute(
      `SELECT b.*, c.name AS category_name, c.color AS category_color
       FROM   budgets     b
       JOIN   categories  c ON c.id = b.category_id
       WHERE  b.category_id = ?`,
      [categoryId],
    );
    return this.first<Budget>(result);
  }

  /**
   * Returns all budgets for active (non-archived) categories.
   */
  async getAll(): Promise<Budget[]> {
    const result = await this.db.execute(
      `SELECT b.*, c.name AS category_name, c.color AS category_color
       FROM   budgets     b
       JOIN   categories  c ON c.id = b.category_id
       WHERE  c.is_archived = 0
       ORDER BY c.name COLLATE NOCASE`,
    );
    return this.rows<Budget>(result);
  }

  /**
   * Computes the current-period spend for a category and returns budget progress.
   * Period bounds are based on the current calendar week (Mon-Sun) or month.
   */
  async getProgress(
    categoryId: number,
    payCycleDay: number | null = null,
  ): Promise<BudgetProgress | null> {
    const budget = await this.getByCategory(categoryId);
    if (!budget) {
      return null;
    }

    const today = new Date();
    let startDate: string;
    let endDate: string;

    if (budget.period === 'weekly') {
      const bounds = this.currentWeekBounds(today);
      startDate = bounds.startDate;
      endDate = bounds.endDate;
    } else {
      if (payCycleDay !== null) {
        // Pay cycle logic
        const getClampedDateStr = (y: number, m: number, d: number) => {
          const lastDayOfMonth = new Date(y, m, 0).getDate();
          const day = Math.min(d, lastDayOfMonth);
          return `${String(y)}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        };

        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        const paydayThisMonth = new Date(currentYear, currentMonth - 1, payCycleDay);
        // Clamping payday this month
        const lastDayThisMonth = new Date(currentYear, currentMonth, 0).getDate();
        const clampedPaydayThisMonth = Math.min(payCycleDay, lastDayThisMonth);

        if (currentDay >= clampedPaydayThisMonth) {
          startDate = getClampedDateStr(currentYear, currentMonth, payCycleDay);
          const nextDate = new Date(currentYear, currentMonth, 1);
          const nextY = nextDate.getFullYear();
          const nextM = nextDate.getMonth() + 1;
          const lastDayNext = new Date(nextY, nextM, 0).getDate();
          const endDay = Math.min(payCycleDay, lastDayNext) - 1;
          const endDateObj = new Date(nextY, nextM - 1, endDay);
          endDate = `${String(endDateObj.getFullYear())}-${String(
            endDateObj.getMonth() + 1,
          ).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;
        } else {
          const prevDate = new Date(currentYear, currentMonth - 2, 1);
          const prevY = prevDate.getFullYear();
          const prevM = prevDate.getMonth() + 1;
          startDate = getClampedDateStr(prevY, prevM, payCycleDay);
          const endDay = clampedPaydayThisMonth - 1;
          const endDateObj = new Date(currentYear, currentMonth - 1, endDay);
          endDate = `${String(endDateObj.getFullYear())}-${String(
            endDateObj.getMonth() + 1,
          ).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;
        }
      } else {
        const bounds = this.currentMonthBounds(today);
        startDate = bounds.startDate;
        endDate = bounds.endDate;
      }
    }

    const result = await this.db.execute(
      `SELECT COALESCE(SUM(amount), 0) AS spent
       FROM   transactions
       WHERE  category_id = ?
         AND  type = 'expense'
         AND  date(date, 'localtime') BETWEEN ? AND ?
         AND  deleted_at IS NULL`,
      [categoryId, startDate, endDate],
    );

    const spent = (this.first<{spent: number}>(result)?.spent) ?? 0;

    return {
      ...budget,
      spent,
      remaining: budget.budget_amount - spent,
      percentage: budget.budget_amount > 0 ? (spent / budget.budget_amount) * 100 : 0,
      periodStart: startDate,
      periodEnd: endDate,
    };
  }

  /**
   * Returns progress for every budgeted, non-archived category.
   */
  async getAllProgress(payCycleDay: number | null = null): Promise<BudgetProgress[]> {
    const budgets = await this.getAll();
    const progressPromises = budgets.map(b => this.getProgress(b.category_id, payCycleDay));
    const results = await Promise.all(progressPromises);
    return results.filter((p): p is BudgetProgress => p !== null);
  }

  /**
   * Creates or fully replaces the budget for a category.
   */
  async upsert({
    category_id,
    budget_amount,
    period,
  }: UpsertBudgetData): Promise<void> {
    await this.withTransaction(async () => {
      await this.db.execute(
        `INSERT INTO budgets (category_id, budget_amount, period)
         VALUES (?, ?, ?)
         ON CONFLICT (category_id)
         DO UPDATE SET budget_amount = excluded.budget_amount,
                       period        = excluded.period`,
        [category_id, budget_amount, period],
      );
    });
  }

  /**
   * Removes the budget definition for a category.
   */
  async delete(categoryId: number): Promise<void> {
    await this.db.execute('DELETE FROM budgets WHERE category_id = ?', [
      categoryId,
    ]);
  }
}

export const budgetRepository = new BudgetRepository();
