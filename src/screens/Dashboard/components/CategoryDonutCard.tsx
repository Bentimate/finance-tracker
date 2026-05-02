import React, {useState} from 'react';
import {View, Text} from 'react-native';
import {PieChart} from 'react-native-gifted-charts';
import {CategorySpend} from '../../../types';
import {formatCurrency, formatCurrencyCompact} from '../../../utils/formatCurrency';
import {styles} from './CategoryDonutCard.styles';
import {theme} from '../../../theme';
import {Card} from '../../../components/Card';

interface Props {
  categorySpend: CategorySpend[];
}

// Fallback color for categories without an explicit color
const FALLBACK_COLOR = theme.colors.textMuted;

const CategoryDonutCard: React.FC<Props> = ({categorySpend}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  if (categorySpend.length === 0) {
    return (
      <Card>
        <Text style={styles.sectionLabel}>Spending by Category</Text>
        <Text style={styles.empty}>No expenses this month</Text>
      </Card>
    );
  }

  const totalExpense = categorySpend.reduce((sum, c) => sum + c.total, 0);

  const pieData = categorySpend.map((cat, i) => ({
    value: cat.total,
    color: cat.color ?? FALLBACK_COLOR,
    focused: focusedIndex === i,
    onPress: () => setFocusedIndex(prev => (prev === i ? null : i)),
  }));

  const focused = focusedIndex !== null ? categorySpend[focusedIndex] : null;

  return (
    <Card>
      <Text style={styles.sectionLabel}>Spending by Category</Text>

      <View style={styles.chartRow}>
        {/* Donut */}
        <PieChart
          data={pieData}
          donut
          radius={80}
          innerRadius={52}
          isAnimated
          animationDuration={600}
          focusOnPress
          toggleFocusOnPress
          centerLabelComponent={() => (
            <View style={styles.donutCenter}>
              <Text style={styles.donutAmount}>
                {formatCurrencyCompact(focused ? focused.total : totalExpense)}
              </Text>
              <Text style={styles.donutCaption}>
                {focused ? focused.name : 'total'}
              </Text>
            </View>
          )}
        />

        {/* Legend */}
        <View style={styles.legend}>
          {categorySpend.map((cat, i) => {
            const pct = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0;
            const isFocused = focusedIndex === i;
            return (
              <View
                key={cat.id}
                style={[styles.legendRow, isFocused && styles.legendRowFocused]}>
                <View style={[styles.legendDot, {backgroundColor: cat.color ?? FALLBACK_COLOR}]} />
                <Text style={styles.legendName} numberOfLines={1}>
                  {cat.name}
                </Text>
                <Text style={styles.legendPct}>{pct.toFixed(0)}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    </Card>
  );
};

export default CategoryDonutCard;
