import React from 'react';
import {View, Text, Dimensions} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';
import {WeeklyTrend} from '../../../types';
import {styles} from './TrendBarCard.styles';
import {theme} from '../../../theme';
import {Card} from '../../../components/Card';

interface Props {
  weeklyTrend: WeeklyTrend[];
}

const CARD_H_PADDING = theme.spacing.lg * 2 + theme.spacing.md * 2;
const CHART_HEIGHT = 160;
const BAR_WIDTH = 16;
const BAR_GAP = 3;      // gap between income/expense within a group
const GROUP_GAP = 14;   // gap between week groups

const TrendBarCard: React.FC<Props> = ({weeklyTrend}) => {
  const chartWidth =
    Dimensions.get('window').width - CARD_H_PADDING - 36; // 36 = y-axis reserved

  if (weeklyTrend.length === 0) {
    return (
      <Card>
        <Text style={styles.sectionLabel}>Income vs Expenses</Text>
        <Text style={styles.empty}>No transactions this month</Text>
      </Card>
    );
  }

  // Build grouped bar data: [income_W1, expense_W1, income_W2, expense_W2, ...]
  // Per-item `spacing` controls the gap after that bar.
  const barData = weeklyTrend.flatMap((week, i) => {
    const isLastGroup = i === weeklyTrend.length - 1;
    return [
      {
        value: week.income,
        label: week.weekLabel,
        frontColor: theme.colors.success,
        spacing: BAR_GAP,
        labelTextStyle: styles.xAxisLabel,
        topLabelComponent: undefined,
      },
      {
        value: week.expense,
        frontColor: theme.colors.error,
        // After the last bar in a group: larger gap (or 0 for the final group)
        spacing: isLastGroup ? 0 : GROUP_GAP,
        labelTextStyle: styles.xAxisLabel,
      },
    ];
  });

  const maxValue = Math.max(
    ...weeklyTrend.flatMap(w => [w.income, w.expense]),
    1,
  );

  return (
    <Card>
      <Text style={styles.sectionLabel}>Income vs Expenses</Text>

      <BarChart
        data={barData}
        barWidth={BAR_WIDTH}
        height={CHART_HEIGHT}
        width={chartWidth}
        maxValue={maxValue}
        noOfSections={4}
        isAnimated
        animationDuration={500}
        // Axes
        xAxisThickness={1}
        xAxisColor={theme.colors.border}
        yAxisThickness={0}
        hideRules={false}
        rulesColor={theme.colors.border}
        rulesType="solid"
        // Y-axis labels
        yAxisTextStyle={styles.yAxisLabel}
        yAxisLabelPrefix="S$"
        yAxisLabelWidth={40}
        // Suppress default bar spacing since we set it per item
        spacing={0}
        // Round top corners
        barBorderTopLeftRadius={3}
        barBorderTopRightRadius={3}
      />

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, {backgroundColor: theme.colors.success}]} />
          <Text style={styles.legendLabel}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, {backgroundColor: theme.colors.error}]} />
          <Text style={styles.legendLabel}>Expenses</Text>
        </View>
      </View>
    </Card>
  );
};

export default TrendBarCard;
