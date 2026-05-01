import React, {useState} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Menu} from 'react-native-paper';
import {Typography} from '../../../components/Typography';
import {theme} from '../../../theme';
import {styles} from '../styles/TransactionListScreen.styles';

interface DateFilterProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const THIS_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({length: 6}, (_, i) => THIS_YEAR - i);

export const DateFilter: React.FC<DateFilterProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}) => {
  const [monthMenuVisible, setMonthMenuVisible] = useState(false);
  const [yearMenuVisible, setYearMenuVisible] = useState(false);

  return (
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
              onMonthChange(i + 1);
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
              onYearChange(y);
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
  );
};
