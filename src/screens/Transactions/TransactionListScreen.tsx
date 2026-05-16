import React, {useState, useCallback, useEffect} from 'react';
import {View, SectionList, DeviceEventEmitter} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {Transaction, DailyNetFlow} from '../../types';
import {transactionRepository} from '../../repositories/transactionRepository';
import {analyticsRepository} from '../../repositories/analyticsRepository';
import {Typography} from '../../components/Typography';
import {Screen} from '../../components/Screen';
import {styles} from './styles/TransactionListScreen.styles';
import {TransactionStackParamList} from '../../navigation/types';

import {TransactionItem} from './components/TransactionItem';
import {ViewModeTabs, ViewMode} from './components/ViewModeTabs';
import {DateFilter} from './components/DateFilter';
import {CalendarView} from './components/CalendarView';
import {DayTransactionsSheet} from './components/DayTransactionsSheet';
import {
  TransactionSection,
  toDateStr,
  getISOWeekBounds,
  groupByDate,
  formatDateLabel,
} from './helpers';
import {PlusButton} from '../../components/PlusButton'
import {EmptyState} from '../../components/EmptyState';
import {useRefreshCoordinator} from '../../hooks/useRefreshCoordinator';

type NavigationProp = NativeStackNavigationProp<TransactionStackParamList, 'TransactionList'>;

const TransactionListScreen: React.FC = () => {
  const now = new Date();

  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [sections, setSections] = useState<TransactionSection[]>([]);
  const [dailyFlowsCache, setDailyFlowsCache] = useState<Record<string, DailyNetFlow[]>>({});
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [earliestYear, setEarliestYear] = useState(now.getFullYear());

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isSheetVisible, setSheetVisible] = useState(false);

  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const isMounted = React.useRef(true);
  const cacheRef = React.useRef<Record<string, DailyNetFlow[]>>({});

  useEffect(() => {
    cacheRef.current = dailyFlowsCache;
  }, [dailyFlowsCache]);

  const fetchBounds = useCallback(async () => {
    const year = await transactionRepository.getEarliestYear();
    if (isMounted.current) {
      setEarliestYear(year);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const loadTransactions = useCallback(async () => {
    const today = new Date();
    try {
      await fetchBounds();

      if (viewMode === 'month') {
        const fetchMonth = async (y: number, m: number) => {
          const key = `${y}-${m}`;
          if (cacheRef.current[key]) return cacheRef.current[key];
          const flows = await analyticsRepository.getDailyNetFlow(y, m);
          setDailyFlowsCache(prev => {
            const next = {...prev, [key]: flows};
            cacheRef.current = next;
            return next;
          });
          return flows;
        };

        // Fetch current month
        await fetchMonth(selectedYear, selectedMonth);

        // Pre-fetch in background
        const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
        const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
        const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
        const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;

        fetchMonth(prevYear, prevMonth);
        fetchMonth(nextYear, nextMonth);
      } else {
        let data: Transaction[] = [];
        if (viewMode === 'today') {
          data = await transactionRepository.getByDay(toDateStr(today));
        } else if (viewMode === 'week') {
          const {start, end} = getISOWeekBounds(today);
          data = await transactionRepository.getByWeek(start, end);
        }
        setSections(groupByDate(data));
      }
    } catch (e) {
      console.error('Failed to load transactions', e);
    }
  }, [viewMode, selectedMonth, selectedYear, fetchBounds]);

  const {requestRefresh} = useRefreshCoordinator(loadTransactions, {
    onBeforeStart: () => setIsLoading(true),
    onComplete: () => setIsLoading(false),
    onError: (e, source) => console.error('Transaction refresh failed', source, e),
  });

  const handleRefresh = useCallback(async () => {
    const clearedCache: Record<string, DailyNetFlow[]> = {};
    cacheRef.current = clearedCache;
    setDailyFlowsCache(clearedCache);
    DeviceEventEmitter.emit('AppRefresh');
    await requestRefresh('manual');
  }, [requestRefresh]);

  useEffect(() => {
    const onAppRefresh = () => {
      const clearedCache: Record<string, DailyNetFlow[]> = {};
      cacheRef.current = clearedCache;
      setDailyFlowsCache(clearedCache);
      void requestRefresh('global_event');
    };
    const sub = DeviceEventEmitter.addListener('AppRefresh', onAppRefresh);
    return () => sub.remove();
  }, [requestRefresh]);

  useEffect(() => {
    if (!isMounted.current) return;
    const params = route.params as any;
    if (params?.handleRefresh !== handleRefresh || params?.isLoading !== isLoading) {
      navigation.setParams({handleRefresh, isLoading} as any);
    }
  }, [navigation, handleRefresh, isLoading, route.params]);

  useEffect(() => {
    void requestRefresh('focus');
  }, [viewMode, selectedMonth, selectedYear, requestRefresh]);

  useFocusEffect(useCallback(() => {
    void requestRefresh('focus');
  }, [requestRefresh]));

  const handleTransactionPress = (id: number) => {
    navigation.navigate('TransactionForm', {transactionId: id});
  };

  const handleDayPress = (date: Date) => {
    setSelectedDay(date);
    setSheetVisible(true);
  };

  return (
    <Screen
      edges={[]}
      header={<ViewModeTabs viewMode={viewMode} onViewModeChange={setViewMode} />}>
      {viewMode === 'month' ? (
        <>
          <DateFilter
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            earliestYear={earliestYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
          <CalendarView
            startDate={new Date(earliestYear, 0, 1)}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            dailyFlowsCache={dailyFlowsCache}
            onMonthChange={(y, m) => {
              setSelectedYear(y);
              setSelectedMonth(m);
            }}
            onDayPress={handleDayPress}
          />
        </>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({item}) => <TransactionItem item={item} onPress={handleTransactionPress} />}
          renderSectionHeader={({section: {title}}) => (
            <View style={styles.dayHeader}>
              <Typography variant="label" color="textMuted">
                {formatDateLabel(title)}
              </Typography>
            </View>
          )}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={<EmptyState message="No transactions for this period." />}
        />
      )}

      <DayTransactionsSheet
        visible={isSheetVisible}
        date={selectedDay}
        onClose={() => setSheetVisible(false)}
        onTransactionPress={handleTransactionPress}
      />

      <PlusButton onPress={() => navigation.navigate('TransactionForm', {categoryId: 0})} />
    </Screen>
  );
};

export default TransactionListScreen;
