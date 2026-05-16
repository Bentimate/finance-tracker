import React, {useMemo, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {Menu} from 'react-native-paper';
import {Typography} from '../../../../components/Typography';
import {styles} from '../DashboardDateFilter.styles';
import {useUserPrefs} from '../../../../context/UserPrefContext';
import {monthRange} from '../../../../repositories/analyticsRepository';

const MONTH_LABELS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  month: number;
  year: number;
  earliestYear: number;
  maxYear?: number;
  maxMonth?: number;
  minYear?: number;
  minMonth?: number;
  label?: string;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export const MonthYearPickerGroup: React.FC<Props> = ({
  month,
  year,
  earliestYear,
  maxYear,
  maxMonth,
  minYear,
  minMonth,
  label,
  onMonthChange,
  onYearChange,
}) => {
  const [monthMenuVisible, setMonthMenuVisible] = useState(false);
  const [yearMenuVisible, setYearMenuVisible] = useState(false);
  const {settings} = useUserPrefs();

  const yearOptions = useMemo(() => {
    const options: number[] = [];
    const upper = maxYear ?? year;
    for (let current = upper; current >= earliestYear; current -= 1) {
      options.push(current);
    }
    return options;
  }, [earliestYear, maxYear, year]);

  const isMonthDisabled = (value: number) => {
    if (maxYear !== undefined && maxMonth !== undefined && year === maxYear && value > maxMonth) {
      return true;
    }
    if (minYear !== undefined && minMonth !== undefined && year === minYear && value < minMonth) {
      return true;
    }
    return false;
  };

  const getMonthTitle = (mValue: number) => {
    if (settings.pay_cycle_day === null) {
      return MONTH_LABELS_FULL[mValue - 1];
    }
    const range = monthRange(year, mValue, settings.pay_cycle_day);
    return range.label ?? MONTH_LABELS_FULL[mValue - 1];
  };

  return (
    <View style={styles.pickerGroup}>
      {label && (
        <Typography variant="caption" color="textMuted" style={styles.pickerLabel}>
          {label}
        </Typography>
      )}
      <View style={styles.pickerRow}>
        <Menu
          visible={monthMenuVisible}
          onDismiss={() => setMonthMenuVisible(false)}
          contentStyle={styles.menuContent}
          anchor={
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setMonthMenuVisible(true)} activeOpacity={0.7}>
              <Typography variant="body" weight="medium">{getMonthTitle(month)}</Typography>
              <Typography variant="caption" color="textMuted">{'  v'}</Typography>
            </TouchableOpacity>
          }>
          {MONTH_LABELS_FULL.map((monthLabel, index) => {
            const monthValue = index + 1;
            const disabled = isMonthDisabled(monthValue);
            return (
              <Menu.Item
                key={monthLabel}
                title={getMonthTitle(monthValue)}
                disabled={disabled}
                onPress={() => {
                  onMonthChange(monthValue);
                  setMonthMenuVisible(false);
                }}
                titleStyle={[
                  styles.menuItemText,
                  month === monthValue && styles.menuItemTextActive,
                  disabled && styles.menuItemTextDisabled,
                ]}
              />
            );
          })}
        </Menu>

        <Menu
          visible={yearMenuVisible}
          onDismiss={() => setYearMenuVisible(false)}
          contentStyle={styles.menuContent}
          anchor={
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setYearMenuVisible(true)} activeOpacity={0.7}>
              <Typography variant="body" weight="medium">{year}</Typography>
              <Typography variant="caption" color="textMuted">{'  v'}</Typography>
            </TouchableOpacity>
          }>
          {yearOptions.map(yearOption => (
            <Menu.Item
              key={yearOption}
              title={String(yearOption)}
              onPress={() => {
                onYearChange(yearOption);
                setYearMenuVisible(false);
              }}
              titleStyle={[styles.menuItemText, year === yearOption && styles.menuItemTextActive]}
            />
          ))}
        </Menu>
      </View>
    </View>
  );
};
