import {useState, useEffect, useCallback} from 'react';
import {MonthlyTotals, CategorySpend, WeeklyTrend} from '../types';
import {
  getMonthlyTotals,
  getCategorySpend,
  getWeeklyTrend,
} from '../repositories/analyticsRepository';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardData {
  totals: MonthlyTotals;
  categorySpend: CategorySpend[];
  weeklyTrend: WeeklyTrend[];
}

export interface UseDashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Fetches all three data sets for the dashboard in a single parallel call.
 * Re-fetches automatically when year/month changes.
 *
 * Callers should also call refresh() via useFocusEffect so the dashboard
 * reflects new transactions added from other tabs.
 */
export function useDashboardData(
  year: number,
  month: number,
): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [totals, categorySpend, weeklyTrend] = await Promise.all([
        getMonthlyTotals(year, month),
        getCategorySpend(year, month),
        getWeeklyTrend(year, month),
      ]);
      setData({totals, categorySpend, weeklyTrend});
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  return {data, loading, error, refresh: load};
}
