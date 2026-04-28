import React, {useState, useCallback} from 'react';
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';

import {useDashboardData} from '../../hooks/useDashboardData';
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

  const {data, loading, error, refresh} = useDashboardData(year, month);

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
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
