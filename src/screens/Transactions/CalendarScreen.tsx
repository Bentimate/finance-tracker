import React, {useState, useCallback, useEffect} from 'react';
import {View, DeviceEventEmitter} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {DailyNetFlow} from '../../types';
import {transactionRepository} from '../../repositories/transactionRepository';
import {analyticsRepository} from '../../repositories/analyticsRepository';
import {Screen} from '../../components/Screen';
import {TransactionStackParamList} from '../../navigation/types';

import {TransactionItem} from './components/TransactionItem';
import {DateFilter} from './components/DateFilter';
import {CalendarView} from './components/CalendarView';
import {DayTransactionsSheet} from './components/DayTransactionsSheet';
import {toDateStr} from './helpers';
import {styles as plusButtonStyles} from '../../components/styles/PlusButton.styles';

type NavigationProp = NativeStackNavigationProp<TransactionStackParamList, 'CalendarView'>;

const CalendarScreen: React.FC = () => {
  const now = new Date();
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

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setDailyFlowsCache({});
    DeviceEventEmitter.emit('AppRefresh');
    await loadCalendar();
    setIsLoading(false);
  }, [loadCalendar]);

  useEffect(() => {
    const params = route.params as any;
    if (params?.handleRefresh !== handleRefresh || params?.isLoading !== isLoading) {
      navigation.setParams({handleRefresh, isLoading} as any);
    }
  }, [navigation, handleRefresh, isLoading, route.params]);

  const fetchBounds = useCallback(async () => {
    const year = await transactionRepository.getEarliestYear();
    if (isMounted.current) {
      setEarliestYear(year);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchBounds();
    return () => {
      isMounted.current = false;
    };
  }, [fetchBounds]);

  const loadCalendar = useCallback(async () => {
    const today = new Date();
    setIsLoading(true);
    try {
      await fetchBounds();

      const fetchMonth = async (y: number, m: number) => {
        const key = `${y}-${m}`;
        if (dailyFlowsCache[key]) return dailyFlowsCache[key];
        const flows = await analyticsRepository.getDailyNetFlow(y, m);
        setDailyFlowsCache(prev => ({...prev, [key]: flows}));
        return flows;
      };

      await fetchMonth(selectedYear, selectedMonth);

      const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
      const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
      const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
      const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;

      fetchMonth(prevYear, prevMonth);
      fetchMonth(nextYear, nextMonth);

    } catch (e) {
      console.error('Failed to load calendar', e);
    } finally {
      setIsLoading(false);
    }
  }, [dailyFlowsCache, fetchBounds, selectedMonth, selectedYear]);

  useEffect(() => {
    const onAppRefresh = () => {
      setDailyFlowsCache({});
      loadCalendar();
    };
    const sub = DeviceEventEmitter.addListener('AppRefresh', onAppRefresh);
    return () => sub.remove();
  }, [loadCalendar]);

  useFocusEffect(
    useCallback(() => {
      loadCalendar();
    }, [loadCalendar]),
  );

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
      header={
        <DateFilter
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          earliestYear={earliestYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
      }>
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

      <DayTransactionsSheet
        visible={isSheetVisible}
        date={selectedDay}
        onClose={() => setSheetVisible(false)}
        onTransactionPress={handleTransactionPress}
      />
    </Screen>
  );
};

export default CalendarScreen;
