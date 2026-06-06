import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Input} from '../../../../components/Input';
import {Typography} from '../../../../components/Typography';
import {RecurrenceFrequency} from '../../../../types';
import {theme} from '../../../../theme';
import {styles} from '../../styles/RecurringTransactionFormScreen.styles';

interface Props {
  frequency: RecurrenceFrequency;
  weeklyDay: number;
  monthlyDay: string;
  yearlyDate: Date;
  onFrequencyChange: (frequency: RecurrenceFrequency) => void;
  onWeeklyDayChange: (day: number) => void;
  onMonthlyDayChange: (day: string) => void;
  onYearlyDatePress: () => void;
}

const FREQUENCY_OPTIONS: Array<{value: RecurrenceFrequency; label: string}> = [
  {value: 'daily', label: 'DAILY'},
  {value: 'weekly', label: 'WEEKLY'},
  {value: 'monthly', label: 'MONTHLY'},
  {value: 'yearly', label: 'YEARLY'},
];

const WEEKDAYS = [
  {value: 0, label: 'Sun'},
  {value: 1, label: 'Mon'},
  {value: 2, label: 'Tue'},
  {value: 3, label: 'Wed'},
  {value: 4, label: 'Thu'},
  {value: 5, label: 'Fri'},
  {value: 6, label: 'Sat'},
];

export const RecurrenceFrequencySection: React.FC<Props> = ({
  frequency,
  weeklyDay,
  monthlyDay,
  yearlyDate,
  onFrequencyChange,
  onWeeklyDayChange,
  onMonthlyDayChange,
  onYearlyDatePress,
}) => {
  return (
    <View style={styles.section}>
      <Typography variant="label" color="textSecondary" style={styles.fieldLabel}>
        FREQUENCY
      </Typography>
      <View style={styles.frequencyTabs}>
        {FREQUENCY_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.frequencyTab,
              frequency === option.value && styles.frequencyTabActive,
            ]}
            onPress={() => onFrequencyChange(option.value)}
            activeOpacity={0.8}>
            <Typography
              variant="caption"
              color={frequency === option.value ? 'primary' : 'textSecondary'}
              weight={frequency === option.value ? 'bold' : 'medium'}>
              {option.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      {frequency === 'weekly' && (
        <View style={styles.weekdayGrid}>
          {WEEKDAYS.map(day => (
            <TouchableOpacity
              key={day.value}
              style={[
                styles.weekdayButton,
                weeklyDay === day.value && styles.weekdayButtonActive,
              ]}
              onPress={() => onWeeklyDayChange(day.value)}
              activeOpacity={0.8}>
              <Typography
                variant="caption"
                color={weeklyDay === day.value ? 'primary' : 'textSecondary'}
                weight={weeklyDay === day.value ? 'bold' : 'medium'}>
                {day.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {frequency === 'monthly' && (
        <Input
          label="DAY OF MONTH"
          value={monthlyDay}
          onChangeText={onMonthlyDayChange}
          keyboardType="number-pad"
          placeholder="1-31"
          helperText="Short months use the last available day."
        />
      )}

      {frequency === 'yearly' && (
        <TouchableOpacity
          style={styles.yearlyButton}
          onPress={onYearlyDatePress}
          activeOpacity={0.8}>
          <Typography variant="body">
            {yearlyDate.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
          </Typography>
          <MaterialIcon name="calendar-month" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};
