import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  DeviceEventEmitter,
  AppState,
} from 'react-native';
import {useFocusEffect, useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useDashboardData} from '../../hooks/useDashboardData';
import {
  DashboardDateFilter,
  DateSelection,
} from './components/DashboardDateFilter';
import {
  monthRange,
  customRange,
  DateRange,
} from '../../repositories/analyticsRepository';
import {analyticsRepository} from '../../repositories/analyticsRepository';
import {database} from '../../database/db';
import CashFlowCard from './components/CashFlowCard';
import TopSpendingCard from './components/TopSpendingCard';
import CategoryDonutCard from './components/CategoryDonutCard';
import TrendBarCard from './components/TrendBarCard';
import {styles} from './DashboardScreen.styles';
import {LoadingState} from '../../components/LoadingState';
import {ErrorState} from '../../components/ErrorState';
import {Screen} from '../../components/Screen';
import {useUserPrefs} from '../../context/UserPrefContext';
import {RootTabParamList} from '../../navigation/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth() + 1;

function selectionToRange(selection: DateSelection, payCycleDay: number | null): DateRange {
  if (selection.mode === 'single') {
    return monthRange(selection.year, selection.month, payCycleDay);
  }
  return customRange(
    selection.startYear,
    selection.startMonth,
    selection.endYear,
    selection.endMonth,
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

const DashboardScreen: React.FC = () => {
  const {settings} = useUserPrefs();
  const route = useRoute<RouteProp<RootTabParamList, 'Dashboard'>>();

  // Initialize state based on current date and pay cycle
  const initialSelection = useMemo((): DateSelection => {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    const day = now.getDate();

    if (settings.pay_cycle_day !== null) {
      // If today is before this month's payday, we are actually in the cycle
      // that started last month. To show "current" data, we default to the
      // previous month's index so monthRange(year, month, payCycleDay)
      // returns the correct bounds.
      const lastDayThisMonth = new Date(year, month, 0).getDate();
      const clampedPayday = Math.min(settings.pay_cycle_day, lastDayThisMonth);

      if (day < clampedPayday) {
        const prev = new Date(year, month - 2, 1);
        year = prev.getFullYear();
        month = prev.getMonth() + 1;
      }
    }

    return {
      mode: 'single',
      year,
      month,
    };
  }, [settings.pay_cycle_day]);

  const [selection, setSelection] = useState<DateSelection>(initialSelection);

  // Update selection if settings change (e.g. user sets payday for first time)
  useEffect(() => {
    setSelection(prev => {
      // If we are currently in single mode, re-evaluate the month/year based on initial logic
      if (prev.mode === 'single') {
        return initialSelection;
      }
      return prev;
    });
  }, [initialSelection]);

  const [earliestYear, setEarliestYear] = useState(CURRENT_YEAR);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const range = selectionToRange(selection, settings.pay_cycle_day);
  const {data, loading, error, refresh} = useDashboardData(range, route.params?.accountId);

  // Fetch the earliest year once on mount — same pattern as TransactionListScreen
  useEffect(() => {
    analyticsRepository.getEarliestYear().then(setEarliestYear);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    DeviceEventEmitter.emit('AppRefresh');
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  useEffect(() => {
    const params = route.params as any;
    if (params?.handleRefresh !== handleRefresh || params?.isRefreshing !== isRefreshing) {
      navigation.setParams({handleRefresh, isRefreshing} as any);
    }
  }, [navigation, handleRefresh, isRefreshing, route.params]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('AppRefresh', () => refresh());
    return () => sub.remove();
  }, [refresh]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', nextAppState => {
      if (nextAppState !== 'active') {
        return;
      }

      void (async () => {
        try {
          await database.ensureReady();
          await refresh();
        } catch (e) {
          console.error('Dashboard resume refresh failed', e);
        }
      })();
    });
    return () => sub.remove();
  }, [refresh]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('WidgetTransactionAdded', () => refresh());
    return () => sub.remove();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <Screen
      edges={[]}
      header={
        <DashboardDateFilter
          selection={selection}
          earliestYear={earliestYear}
          onChange={setSelection}
        />
      }>
      {loading && <LoadingState />}

      {!loading && error && <ErrorState message={error} onRetry={refresh} />}

      {!loading && !error && data && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <CashFlowCard totals={data.totals} />
          <CategoryDonutCard
            donutSpend={data.donutSpend}
            donutParents={data.donutParents}
            range={range}
          />
          <TopSpendingCard categorySpend={data.categorySpend} />
          {/* <TrendBarCard weeklyTrend={data.weeklyTrend} /> */}
        </ScrollView>
      )}
    </Screen>
  );
};

export default DashboardScreen;
