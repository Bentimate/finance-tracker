import React, {useRef, useEffect, useMemo, useCallback} from 'react';
import {View, FlatList, Dimensions, Text} from 'react-native';
import {DailyNetFlow} from '../../../types';
import {getCalendarGrid, WEEKDAYS} from '../calendarHelpers';
import {styles} from '../styles/CalendarView.styles';
import {CalendarDayCell} from './CalendarDayCell';
import {toDateStr} from '../helpers';

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

  // Convert array to O(1) lookup map
  const flowMap = useMemo(() => {
    const map = new Map<string, number>();
    if (dailyFlows) {
      dailyFlows.forEach(f => map.set(f.date, f.netFlow));
    }
    return map;
  }, [dailyFlows]);

  return (
    <View style={styles.monthContainer}>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map(day => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((day, i) => {
          const dateStr = toDateStr(day.date);
          const netFlow = flowMap.get(dateStr) ?? 0;
          return (
            <CalendarDayCell
              key={`${year}-${month}-${i}`}
              day={day}
              netFlow={netFlow}
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
    } else {
      console.warn(`CalendarView: currentIndex ${currentIndex} out of bounds [0, ${monthIndices.length - 1}]`);
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
