import React, {useState, useCallback, useEffect} from 'react';
import {View, TouchableOpacity, SectionList, DeviceEventEmitter} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Menu} from 'react-native-paper';

import {Transaction} from '../../types';
import {
  getTransactionsByDay,
  getTransactionsByWeek,
  getTransactionsByMonth,
} from '../../repositories/transactionRepository';
import {Typography} from '../../components/Typography';
import {formatCurrency} from '../../utils/formatCurrency';
import {theme} from '../../theme';
import {styles} from './styles/TransactionListScreen.styles';
import {TransactionStackParamList} from '../../navigation/types';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type NavigationProp = NativeStackNavigationProp<TransactionStackParamList, 'TransactionList'>;
type ViewMode = 'today' | 'week' | 'month';

interface TransactionSection {
  title: string;
  data: Transaction[];
}

const TABS: {key: ViewMode; label: string}[] = [
  {key: 'today', label: 'Today'},
  {key: 'week', label: 'Week'},
  {key: 'month', label: 'Month'},
];

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const THIS_YEAR = new Date().getFullYear();
// Show current year and 5 years back, newest first
const YEAR_OPTIONS = Array.from({length: 6}, (_, i) => THIS_YEAR - i);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Returns Monday and Sunday of the ISO week containing `date`. */
function getISOWeekBounds(date: Date): {start: string; end: string} {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {start: toDateStr(monday), end: toDateStr(sunday)};
}

function groupByDate(transactions: Transaction[]): TransactionSection[] {
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach(tx => {
    const date = tx.date.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
  });
  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map(date => ({title: date, data: groups[date]}));
}

function formatDateLabel(dateStr: string): string {
  const today = new Date();
  const todayStr = toDateStr(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = toDateStr(yesterday);

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';

  // Parse as local date to avoid timezone offset shifting the day
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

const TransactionListScreen: React.FC = () => {
  const now = new Date();

  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [sections, setSections] = useState<TransactionSection[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [monthMenuVisible, setMonthMenuVisible] = useState(false);
  const [yearMenuVisible, setYearMenuVisible] = useState(false);

  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------

  const loadTransactions = useCallback(async () => {
    const today = new Date();
    let data: Transaction[] = [];

    if (viewMode === 'today') {
      data = await getTransactionsByDay(toDateStr(today));
    } else if (viewMode === 'week') {
      const {start, end} = getISOWeekBounds(today);
      data = await getTransactionsByWeek(start, end);
    } else {
      data = await getTransactionsByMonth(selectedYear, selectedMonth);
    }

    setSections(groupByDate(data));
  }, [viewMode, selectedMonth, selectedYear]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    DeviceEventEmitter.emit('AppRefresh');
    await loadTransactions();
    setIsLoading(false);
  }, [loadTransactions]);

  // Pass refresh handler up to navigator (for the RefreshHeader button)
  useEffect(() => {
    const params = route.params as any;
    if (params?.handleRefresh !== handleRefresh || params?.isLoading !== isLoading) {
      navigation.setParams({handleRefresh, isLoading} as any);
    }
  }, [navigation, handleRefresh, isLoading, route.params]);

  // Listen for global refresh events (e.g. triggered from other screens/widget)
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('AppRefresh', loadTransactions);
    return () => sub.remove();
  }, [loadTransactions]);

  // Refresh when tab comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderItem = ({item}: {item: Transaction}) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => navigation.navigate('TransactionForm', {transactionId: item.id})}
      activeOpacity={0.6}>
      <View
        style={[
          styles.categoryDot,
          {backgroundColor: item.category_color || theme.colors.textMuted},
        ]}
      />
      <View style={styles.txInfo}>
        <Typography variant="body" weight="medium">
          {item.category_name || 'Uncategorized'}
        </Typography>
        {item.note ? (
          <Typography variant="caption" color="textSecondary" numberOfLines={1}>
            {item.note}
          </Typography>
        ) : null}
      </View>
      <View style={styles.txAmount}>
        <Typography
          variant="body"
          weight="bold"
          color={item.type === 'income' ? 'success' : 'text'}>
          {item.type === 'income' ? '+' : '-'}
          {formatCurrency(item.amount)}
        </Typography>
      </View>
    </TouchableOpacity>
  );

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* ── Tab bar ── */}
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, viewMode === tab.key && styles.tabActive]}
            onPress={() => setViewMode(tab.key)}
            activeOpacity={0.7}>
            <Typography
              variant="label"
              color={viewMode === tab.key ? 'primary' : 'textMuted'}>
              {tab.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Month / year dropdowns (Month tab only) ── */}
      {viewMode === 'month' && (
        <View style={styles.monthSelectorRow}>
          {/* Month picker */}
          <Menu
            visible={monthMenuVisible}
            onDismiss={() => setMonthMenuVisible(false)}
            contentStyle={styles.menuContent}
            anchor={
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setMonthMenuVisible(true)}
                activeOpacity={0.7}>
                <Typography variant="body" weight="medium">
                  {MONTH_LABELS[selectedMonth - 1]}
                </Typography>
                <Typography variant="caption" color="textMuted">
                  {'  ▾'}
                </Typography>
              </TouchableOpacity>
            }>
            {MONTH_LABELS.map((label, i) => (
              <Menu.Item
                key={label}
                title={label}
                onPress={() => {
                  setSelectedMonth(i + 1);
                  setMonthMenuVisible(false);
                }}
                titleStyle={
                  selectedMonth === i + 1
                    ? {color: theme.colors.primary, fontWeight: '700'}
                    : undefined
                }
              />
            ))}
          </Menu>

          {/* Year picker */}
          <Menu
            visible={yearMenuVisible}
            onDismiss={() => setYearMenuVisible(false)}
            contentStyle={styles.menuContent}
            anchor={
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setYearMenuVisible(true)}
                activeOpacity={0.7}>
                <Typography variant="body" weight="medium">
                  {selectedYear}
                </Typography>
                <Typography variant="caption" color="textMuted">
                  {'  ▾'}
                </Typography>
              </TouchableOpacity>
            }>
            {YEAR_OPTIONS.map(y => (
              <Menu.Item
                key={y}
                title={String(y)}
                onPress={() => {
                  setSelectedYear(y);
                  setYearMenuVisible(false);
                }}
                titleStyle={
                  selectedYear === y
                    ? {color: theme.colors.primary, fontWeight: '700'}
                    : undefined
                }
              />
            ))}
          </Menu>
        </View>
      )}

      {/* ── Transaction list ── */}
      <SectionList
        sections={sections}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
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

      {/* ── FAB ── */}
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
