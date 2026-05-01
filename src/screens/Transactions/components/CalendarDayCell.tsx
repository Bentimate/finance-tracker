import React from 'react';
import {Pressable, View, Text} from 'react-native';
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
    <Pressable
      style={[
        styles.dayCell,
        !day.isCurrentMonth && styles.dayCellInactive
      ]}
      onPress={() => onPress(day.date)}
    >
      <Text
        style={[
          styles.dayNumber,
          day.isToday && styles.todayIndicator,
          !day.isCurrentMonth && styles.dayNumberInactive
        ]}
      >
        {day.date.getDate()}
      </Text>

      {netFlow !== 0 && (
        <View style={styles.flowContainer}>
          <Text
            style={[
              styles.flowText,
              netFlow > 0 ? styles.flowSuccess : styles.flowError
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {netFlow > 0 ? '+' : ''}{formatCurrency(netFlow)}
          </Text>
        </View>
      )}
    </Pressable>
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
