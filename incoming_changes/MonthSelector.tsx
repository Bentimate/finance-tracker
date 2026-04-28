import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {styles} from './MonthSelector.styles';

interface Props {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];

const MonthSelector: React.FC<Props> = ({year, month, onPrev, onNext}) => {
  const now = new Date();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrev} style={styles.chevronBtn} hitSlop={12}>
        <Text style={styles.chevron}>‹</Text>
      </TouchableOpacity>

      <View style={styles.labelWrapper}>
        <Text style={styles.label}>
          {MONTH_NAMES[month - 1]} {year}
        </Text>
        {isCurrentMonth && <View style={styles.currentDot} />}
      </View>

      <TouchableOpacity
        onPress={onNext}
        style={styles.chevronBtn}
        hitSlop={12}
        disabled={isCurrentMonth}>
        <Text style={[styles.chevron, isCurrentMonth && styles.chevronDisabled]}>
          ›
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MonthSelector;
