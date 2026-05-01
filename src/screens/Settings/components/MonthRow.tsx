import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {styles} from '../SettingsScreen.styles';
import {MONTH_NAMES} from '../helpers';

interface MonthRowProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

export const MonthRow: React.FC<MonthRowProps> = ({year, month, onPrev, onNext}) => {
  const now = new Date();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <View style={styles.monthRow}>
      <TouchableOpacity onPress={onPrev} hitSlop={12} style={styles.chevronBtn}>
        <Text style={styles.chevron}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.monthLabel}>
        {MONTH_NAMES[month - 1]} {year}
      </Text>
      <TouchableOpacity
        onPress={onNext}
        hitSlop={12}
        style={styles.chevronBtn}
        disabled={isCurrentMonth}>
        <Text style={[styles.chevron, isCurrentMonth && styles.chevronDisabled]}>
          ›
        </Text>
      </TouchableOpacity>
    </View>
  );
};
