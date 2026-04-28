import React from 'react';
import {View, Text} from 'react-native';
import {MonthlyTotals} from '../../../types';
import {formatCurrency} from '../../../utils/formatCurrency';
import {styles} from './CashFlowCard.styles';

interface Props {
  totals: MonthlyTotals;
}

interface BarRowProps {
  label: string;
  value: number;
  maxValue: number;
  barStyle: object;
  amountStyle: object;
}

const BarRow: React.FC<BarRowProps> = ({
  label,
  value,
  maxValue,
  barStyle,
  amountStyle,
}) => {
  const widthPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, barStyle, {width: `${widthPercent}%`}]} />
      </View>
      <Text style={[styles.barAmount, amountStyle]}>{formatCurrency(value)}</Text>
    </View>
  );
};

const CashFlowCard: React.FC<Props> = ({totals}) => {
  const {totalIncome, totalExpense, netCashFlow} = totals;
  const maxValue = Math.max(totalIncome, totalExpense, 1);
  const isPositive = netCashFlow >= 0;
  const hasData = totalIncome > 0 || totalExpense > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>Cash Flow</Text>

      {/* Net — headline number */}
      <View style={styles.netRow}>
        <Text style={[styles.netAmount, isPositive ? styles.positiveText : styles.negativeText]}>
          {isPositive ? '+' : '−'}{formatCurrency(Math.abs(netCashFlow))}
        </Text>
        <Text style={styles.netCaption}>net this month</Text>
      </View>

      {hasData ? (
        <View style={styles.bars}>
          <BarRow
            label="Income"
            value={totalIncome}
            maxValue={maxValue}
            barStyle={styles.incomeBar}
            amountStyle={styles.incomeText}
          />
          <BarRow
            label="Expenses"
            value={totalExpense}
            maxValue={maxValue}
            barStyle={styles.expenseBar}
            amountStyle={styles.expenseText}
          />
        </View>
      ) : (
        <Text style={styles.empty}>No transactions this month</Text>
      )}
    </View>
  );
};

export default CashFlowCard;
