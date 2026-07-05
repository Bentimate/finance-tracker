import React, {useState, useMemo} from 'react';
import {View} from 'react-native';
import {Menu} from 'react-native-paper';
import {theme} from '../../../theme';
import {styles} from '../styles/TransactionListScreen.styles';
import {Dropdown} from '../../../components/Dropdown';

interface DateFilterProps {
  selectedMonth: number;
  selectedYear: number;
  earliestYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const THIS_YEAR = new Date().getFullYear();

export const DateFilter: React.FC<DateFilterProps> = ({
  selectedMonth,
  selectedYear,
  earliestYear,
  onMonthChange,
  onYearChange,
}) => {
  const [monthMenuVisible, setMonthMenuVisible] = useState(false);
  const [yearMenuVisible, setYearMenuVisible] = useState(false);

  const yearOptions = useMemo(() => {
    const options = [];
    for (let y = THIS_YEAR; y >= earliestYear; y--) {
      options.push(y);
    }
    return options;
  }, [earliestYear]);

  return (
    <View style={styles.monthSelectorRow}>
      {/* Month picker */}
      <Dropdown
        value={MONTH_LABELS[selectedMonth - 1]}
        visible={monthMenuVisible}
        onDismiss={() => setMonthMenuVisible(false)}
        onPress={() => setMonthMenuVisible(true)}
        style={styles.dropdownButton}>
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
      </Dropdown>

      {/* Year picker */}
      <Dropdown
        value={String(selectedYear)}
        visible={yearMenuVisible}
        onDismiss={() => setYearMenuVisible(false)}
        onPress={() => setYearMenuVisible(true)}
        style={styles.dropdownButton}>
        {yearOptions.map(y => (
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
      </Dropdown>
    </View>
  );
};
