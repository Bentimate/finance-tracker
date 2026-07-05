export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string | null;
  parent_id: number | null;
  is_archived: number;
}

/**
 * A root category with its active children hydrated in memory.
 * Read/display only — never passed to write methods.
 */
export interface ParentCategory extends Category {
  children: Category[];
}

/**
 * Virtual "Others" bucket — represents transactions assigned directly to a
 * parent that has children. Has no DB record; discriminated by `type: 'others'`
 * so TypeScript prevents it being passed to any write path.
 */
export interface VirtualOthersCategory {
  type: 'others';
  parentId: number;
  parentName: string;
  color: string;
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category_id: number;
  note?: string | null;
  recurring_transaction_id?: number | null;
  recurring_occurrence_date?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Joined fields
  category_name?: string;
  category_color?: string;
  // Joined fields for nested display — populated when category is a child
  category_parent_name?: string;
  category_icon?: string | null;
}

export interface Budget {
  category_id: number;
  budget_amount: number;
  period: 'weekly' | 'monthly';
  // Joined fields
  category_name?: string;
  category_color?: string;
}

export interface BudgetProgress extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
  periodStart: string;
  periodEnd: string;
}

export interface MonthlyTotals {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
}

export interface CategorySpend {
  id: number;
  name: string;
  color: string;
  total: number;
}

export interface WeeklyTrend {
  /** SQLite week-of-year string, e.g. "04" */
  weekNum: string;
  /** Human label within the selected month, e.g. "W1", "W2" */
  weekLabel: string;
  income: number;
  expense: number;
}

export interface DailyNetFlow {
  /** 'YYYY-MM-DD' */
  date: string;
  netFlow: number;
}

export interface UserSettings {
  pay_cycle_day: number | null;
}

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  note?: string | null;
  frequency: RecurrenceFrequency;
  interval_value: number | null;
  next_occurrence: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  category_name?: string;
  category_color?: string;
  category_icon?: string | null;
  category_parent_name?: string;
}

export interface CreateRecurringTransactionData {
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  note?: string;
  frequency: RecurrenceFrequency;
  interval_value?: number | null;
  next_occurrence: string;
}
