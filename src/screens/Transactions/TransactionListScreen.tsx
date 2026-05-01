import React, {useState, useCallback, useEffect} from 'react';
import {View, TouchableOpacity, SectionList, DeviceEventEmitter} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {Transaction} from '../../types';
import {transactionRepository} from '../../repositories/transactionRepository';
import {Typography} from '../../components/Typography';
import {styles} from './styles/TransactionListScreen.styles';
import {TransactionStackParamList} from '../../navigation/types';

import {TransactionItem} from './components/TransactionItem';
import {ViewModeTabs, ViewMode} from './components/ViewModeTabs';
import {DateFilter} from './components/DateFilter';
import {
  TransactionSection,
  toDateStr,
  getISOWeekBounds,
  groupByDate,
  formatDateLabel,
} from './helpers';

type NavigationProp = NativeStackNavigationProp<TransactionStackParamList, 'TransactionList'>;

const TransactionListScreen: React.FC = () => {
  const now = new Date();

  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [sections, setSections] = useState<TransactionSection[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const loadTransactions = useCallback(async () => {
    const today = new Date();
    let data: Transaction[] = [];

    if (viewMode === 'today') {
      data = await transactionRepository.getByDay(toDateStr(today));
    } else if (viewMode === 'week') {
      const {start, end} = getISOWeekBounds(today);
      data = await transactionRepository.getByWeek(start, end);
    } else {
      data = await transactionRepository.getByMonth(selectedYear, selectedMonth);
    }

    setSections(groupByDate(data));
  }, [viewMode, selectedMonth, selectedYear]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    DeviceEventEmitter.emit('AppRefresh');
    await loadTransactions();
    setIsLoading(false);
  }, [loadTransactions]);

  useEffect(() => {
    const params = route.params as any;
    if (params?.handleRefresh !== handleRefresh || params?.isLoading !== isLoading) {
      navigation.setParams({handleRefresh, isLoading} as any);
    }
  }, [navigation, handleRefresh, isLoading, route.params]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('AppRefresh', loadTransactions);
    return () => sub.remove();
  }, [loadTransactions]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  const handleTransactionPress = (id: number) => {
    navigation.navigate('TransactionForm', {transactionId: id});
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ViewModeTabs viewMode={viewMode} onViewModeChange={setViewMode} />

      {viewMode === 'month' && (
        <DateFilter
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
      )}

      <SectionList
        sections={sections}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <TransactionItem item={item} onPress={handleTransactionPress} />
        )}
        renderSectionHeader={({section: {title}}) => (
          <View style={styles.dayHeader}>
            <Typography variant="label" color="textMuted">
              {formatDateLabel(title)}
            </Typography>
          </View>
        )}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Typography variant="body" color="textMuted" align="center">
              No transactions for this period.
            </Typography>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TransactionForm', {})}
        activeOpacity={0.8}>
        <Typography style={styles.fabText}>+</Typography>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default TransactionListScreen;
