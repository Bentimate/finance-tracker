import React, {useRef, useEffect, useMemo, useCallback} from 'react';
import {View, FlatList, Dimensions} from 'react-native';
import {Typography} from '../../../components/Typography';
import {DailyNetFlow} from '../../../types';
import {getCalendarGrid, WEEKDAYS} from '../calendarHelpers';
import {styles} from '../styles/CalendarView.styles';
import {CalendarDayCell} from './CalendarDayCell';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface CalendarViewProps {
  startDate: Date;
  selectedYear: number;
  selectedMonth: number;
  dailyFlowsCache: Record<string, DailyNetFlow[]>;
  onMonthChange: (year: number, month: number) => void;
  onDayPress: (date: Date) => void;
}

const END_DATE = new Date(new Date().getFullYear() + 2, 11, 31);

function getMonthDiff(d1: Date, d2: Date) {
  return (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth();
}

function getDateFromIndex(startDate: Date, index: number): {year: number; month: number} {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + index);
  return {year: d.getFullYear(), month: d.getMonth() + 1};
}

// Sub-component for a single month to allow granular memoization
const MonthGrid = React.memo(({
  year,
  month,
  dailyFlows,
  onDayPress
}: {
  year: number;
  month: number;
  dailyFlows: DailyNetFlow[];
  onDayPress: (date: Date) => void;
}) => {
  const grid = useMemo(() => getCalendarGrid(year, month), [year, month]);

  return (
    <View style={styles.monthContainer}>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map(day => (
          <View key={day} style={styles.weekdayCell}>
            <Typography variant="caption" color="textMuted" weight="bold">
              {day}
            </Typography>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((day, i) => {
          const dateStr = day.date.toISOString().split('T')[0];
          const flowData = dailyFlows?.find(f => f.date === dateStr);
          return (
            <CalendarDayCell
              key={`${year}-${month}-${i}`}
              day={day}
              netFlow={flowData?.netFlow ?? 0}
              onPress={onDayPress}
            />
          );
        })}
      </View>
    </View>
  );
});

export const CalendarView: React.FC<CalendarViewProps> = ({
  startDate,
  selectedYear,
  selectedMonth,
  dailyFlowsCache,
  onMonthChange,
  onDayPress,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const totalMonths = useMemo(() => getMonthDiff(startDate, END_DATE) + 1, [startDate]);
  const monthIndices = useMemo(() => Array.from({length: totalMonths}, (_, i) => i), [totalMonths]);

  const currentIndex = useMemo(() =>
    getMonthDiff(startDate, new Date(selectedYear, selectedMonth - 1, 1)),
    [startDate, selectedYear, selectedMonth]
  );

  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < monthIndices.length) {
      flatListRef.current?.scrollToIndex({index: currentIndex, animated: true});
    }
  }, [currentIndex, monthIndices.length]);

  const handleScrollEnd = useCallback((e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < monthIndices.length) {
      const {year, month} = getDateFromIndex(startDate, index);
      onMonthChange(year, month);
    }
  }, [currentIndex, onMonthChange, startDate, monthIndices.length]);

  const renderMonth = useCallback(({item: index}: {item: number}) => {
    const {year, month} = getDateFromIndex(startDate, index);
    const cacheKey = `${year}-${month}`;

    return (
      <MonthGrid
        year={year}
        month={month}
        dailyFlows={dailyFlowsCache[cacheKey] || []}
        onDayPress={onDayPress}
      />
    );
  }, [dailyFlowsCache, onDayPress, startDate]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={monthIndices}
        keyExtractor={item => item.toString()}
        renderItem={renderMonth}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        initialScrollIndex={currentIndex}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        // Performance Tuning
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        removeClippedSubviews={true}
        decelerationRate="fast"
      />
    </View>
  );
};
