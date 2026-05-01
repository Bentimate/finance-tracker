import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {Typography} from '../../../components/Typography';
import {theme} from '../../../theme';
import {formatCurrency} from '../../../utils/formatCurrency';
import {CalendarDay} from '../calendarHelpers';
import {styles} from '../styles/CalendarView.styles';

interface CalendarDayCellProps {
  day: CalendarDay;
  netFlow: number;
  onPress: (date: Date) => void;
}

const CalendarDayCellComponent: React.FC<CalendarDayCellProps> = ({
  day,
  netFlow,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.dayCell,
        !day.isCurrentMonth && styles.dayCellInactive
      ]}
      onPress={() => onPress(day.date)}
    >
      <Typography
        style={[
          styles.dayNumber,
          day.isToday && styles.todayIndicator,
          !day.isCurrentMonth && {color: theme.colors.textMuted}
        ]}
      >
        {day.date.getDate()}
      </Typography>

      {netFlow !== 0 && (
        <View style={styles.flowContainer}>
          <Typography
            style={styles.flowText}
            numberOfLines={1}
            adjustsFontSizeToFit
            color={netFlow > 0 ? 'success' : 'error'}
          >
            {netFlow > 0 ? '+' : ''}{formatCurrency(netFlow)}
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Memoize to prevent re-renders unless day data or flow changes
export const CalendarDayCell = React.memo(CalendarDayCellComponent, (prev, next) => {
  return (
    prev.day.date.getTime() === next.day.date.getTime() &&
    prev.day.isCurrentMonth === next.day.isCurrentMonth &&
    prev.day.isToday === next.day.isToday &&
    prev.netFlow === next.netFlow
  );
});
