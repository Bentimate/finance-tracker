export interface Category {
  id: number;
  name: string;
  color: string;
  is_archived: number;
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category_id: number;
  note?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Joined fields
  category_name?: string;
  category_color?: string;
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
