import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  DeviceEventEmitter,
  AppState,
} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
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
import CashFlowCard from './components/CashFlowCard';
import TopSpendingCard from './components/TopSpendingCard';
import CategoryDonutCard from './components/CategoryDonutCard';
import TrendBarCard from './components/TrendBarCard';
import {styles} from './DashboardScreen.styles';
import {LoadingState} from '../../components/LoadingState';
import {ErrorState} from '../../components/ErrorState';
import {Screen} from '../../components/Screen';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth() + 1;

function selectionToRange(selection: DateSelection): DateRange {
  if (selection.mode === 'single') {
    return monthRange(selection.year, selection.month);
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
  const [selection, setSelection] = useState<DateSelection>({
    mode: 'single',
    year: CURRENT_YEAR,
    month: CURRENT_MONTH,
  });
  const [earliestYear, setEarliestYear] = useState(CURRENT_YEAR);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();

  const range = selectionToRange(selection);
  const {data, loading, error, refresh} = useDashboardData(range);

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
      if (nextAppState === 'active') refresh();
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
          <TopSpendingCard categorySpend={data.categorySpend} />
          <CategoryDonutCard
            donutSpend={data.donutSpend}
            donutParents={data.donutParents}
            range={range}
          />
          {/* <TrendBarCard weeklyTrend={data.weeklyTrend} /> */}
        </ScrollView>
      )}
    </Screen>
  );
};

export default DashboardScreen;