// ─── Append these interfaces to your existing src/types.ts ───────────────────

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
