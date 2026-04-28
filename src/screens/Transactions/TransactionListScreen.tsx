import React, {useState, useCallback} from 'react';
import {View, FlatList, TouchableOpacity, SectionList} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {Transaction} from '../../types';
import {getTransactionsByMonth} from '../../repositories/transactionRepository';
import {Typography} from '../../components/Typography';
import {theme} from '../../theme';
import {styles} from './styles/TransactionListScreen.styles';
import {TransactionStackParamList} from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<TransactionStackParamList, 'TransactionList'>;

interface TransactionSection {
  title: string;
  data: Transaction[];
}

const TransactionListScreen: React.FC = () => {
  const [sections, setSections] = useState<TransactionSection[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const navigation = useNavigation<NavigationProp>();

  const loadTransactions = useCallback(async () => {
    const data = await getTransactionsByMonth(currentYear, currentMonth);

    // Group by date
    const groups: {[key: string]: Transaction[]} = {};
    data.forEach(tx => {
      const date = tx.date.split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
    });

    const sectionData = Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(date => ({
        title: date,
        data: groups[date],
      }));

    setSections(sectionData);
  }, [currentMonth, currentYear]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
    }).format(amount);
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const renderItem = ({item}: {item: Transaction}) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => navigation.navigate('TransactionForm', {transactionId: item.id})}
      activeOpacity={0.6}
    >
      <View style={[styles.categoryDot, {backgroundColor: item.category_color || theme.colors.textMuted}]} />
      <View style={styles.txInfo}>
        <Typography variant="body" weight="medium">{item.category_name || 'Uncategorized'}</Typography>
        {item.note ? (
          <Typography variant="caption" color="textSecondary" numberOfLines={1}>{item.note}</Typography>
        ) : null}
      </View>
      <View style={styles.txAmount}>
        <Typography
          variant="body"
          weight="bold"
          color={item.type === 'income' ? 'success' : 'text'}
        >
          {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
        </Typography>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Typography variant="h2">{new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}</Typography>
        <View style={styles.filterContainer}>
          <TouchableOpacity style={[styles.filterButton, styles.filterButtonActive]}>
            <Typography variant="label" color="primary">Month</Typography>
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        renderSectionHeader={({section: {title}}) => (
          <View style={styles.dayHeader}>
            <Typography variant="label" color="textMuted">{formatDateLabel(title)}</Typography>
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
