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
import MonthSelector from './components/MonthSelector';
import CashFlowCard from './components/CashFlowCard';
import TopSpendingCard from './components/TopSpendingCard';
import CategoryDonutCard from './components/CategoryDonutCard';
import TrendBarCard from './components/TrendBarCard';
import {styles} from './DashboardScreen.styles';
import {theme} from '../../theme';
import {prevMonth, nextMonth} from './helpers';
import {LoadingState} from '../../components/LoadingState';
import {ErrorState} from '../../components/ErrorState';
import {Screen} from '../../components/Screen';

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
    const subscription = DeviceEventEmitter.addListener('AppRefresh', () => {
      refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        refresh();
      }
    });
    return () => subscription.remove();
  }, [refresh]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'WidgetTransactionAdded',
      () => {
        refresh();
      },
    );
    return () => subscription.remove();
  }, [refresh]);

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
    <Screen
      edges={[]}
      header={
        <MonthSelector year={year} month={month} onPrev={handlePrev} onNext={handleNext} />
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
          <CategoryDonutCard categorySpend={data.categorySpend} />
          <TrendBarCard weeklyTrend={data.weeklyTrend} />
        </ScrollView>
      )}
    </Screen>
  );
};

export default DashboardScreen;
