import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  DeviceEventEmitter,
  AppState,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useDashboardData} from '../../hooks/useDashboardData';
// ...
import MonthSelector from './components/MonthSelector';
import CashFlowCard from './components/CashFlowCard';
import TopSpendingCard from './components/TopSpendingCard';
import CategoryDonutCard from './components/CategoryDonutCard';
import TrendBarCard from './components/TrendBarCard';
import {styles} from './DashboardScreen.styles';
import {theme} from '../../theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function prevMonth(year: number, month: number) {
  return month === 1 ? {year: year - 1, month: 12} : {year, month: month - 1};
}

function nextMonth(year: number, month: number) {
  return month === 12 ? {year: year + 1, month: 1} : {year, month: month + 1};
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

const DashboardScreen: React.FC = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const {data, loading, error, refresh} = useDashboardData(year, month);
  const route = useRoute();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Broadcast a global refresh event so other screens (like Transaction List, Budgets)
    // will re-fetch data from the database if they are mounted.
    DeviceEventEmitter.emit('AppRefresh');

    // Specifically refresh dashboard data
    await refresh();

    setIsRefreshing(false);
  }, [refresh]);

  // Pass refresh handler to navigation params
  useEffect(() => {
    const params = route.params as any;
    if (params?.handleRefresh !== handleRefresh || params?.isRefreshing !== isRefreshing) {
      navigation.setParams({handleRefresh, isRefreshing} as any);
    }
  }, [navigation, handleRefresh, isRefreshing, route.params]);

  // Re-fetch when ANY part of the app triggers a global refresh
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('AppRefresh', () => {
      refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  // Refresh when app returns from background to catch widget writes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        refresh();
      }
    });
    return () => subscription.remove();
  }, [refresh]);

  // Re-fetch when the widget adds a transaction
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'WidgetTransactionAdded',
      () => {
        refresh();
      },
    );
    return () => subscription.remove();
  }, [refresh]);

  // Re-fetch when navigating back from other tabs
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handlePrev = () => {
    const p = prevMonth(year, month);
    setYear(p.year);
    setMonth(p.month);
  };

  const handleNext = () => {
    const isCurrentMonth =
      year === now.getFullYear() && month === now.getMonth() + 1;
    if (isCurrentMonth) {
      return;
    }
    const n = nextMonth(year, month);
    setYear(n.year);
    setMonth(n.month);
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <MonthSelector
        year={year}
        month={month}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {loading && (
        <View style={styles.centeredFill}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.centeredFill}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && data && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <CashFlowCard totals={data.totals} />
          <TopSpendingCard categorySpend={data.categorySpend} />
          <CategoryDonutCard categorySpend={data.categorySpend} />
          <TrendBarCard weeklyTrend={data.weeklyTrend} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default DashboardScreen;
