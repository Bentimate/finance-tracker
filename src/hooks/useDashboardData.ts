import {useState, useEffect, useCallback} from 'react';
import {MonthlyTotals, CategorySpend, WeeklyTrend} from '../types';
import {
  analyticsRepository,
  ParentCategoryOption,
  DateRange,
} from '../repositories/analyticsRepository';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardData {
  totals: MonthlyTotals;
  categorySpend: CategorySpend[];
  donutSpend: CategorySpend[];
  donutParents: ParentCategoryOption[];
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
 * Fetches all dashboard data sets for the given date range in a single
 * parallel call. Re-fetches automatically when the range changes.
 *
 * Callers should also call refresh() via useFocusEffect so the dashboard
 * reflects new transactions added from other tabs.
 */
export function useDashboardData(range: DateRange): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (showLoadingSpinner = true) => {
      if (showLoadingSpinner) setLoading(true);
      setError(null);
      try {
        const [totals, categorySpend, donutSpend, donutParents, weeklyTrend] =
          await Promise.all([
            analyticsRepository.getMonthlyTotals(range),
            analyticsRepository.getCategorySpend(range),
            analyticsRepository.getParentCategorySpend(range),
            analyticsRepository.getDonutParentOptions(range),
            analyticsRepository.getWeeklyTrend(range),
          ]);
        setData({totals, categorySpend, donutSpend, donutParents, weeklyTrend});
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    },
    // Depend on the date strings so a new range triggers a re-fetch
    [range.startDate, range.endDate],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  const refresh = useCallback(() => load(false), [load]);

  return {data, loading, error, refresh};
}