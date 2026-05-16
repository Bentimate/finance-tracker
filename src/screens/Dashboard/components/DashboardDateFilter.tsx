import React from 'react';
import {View} from 'react-native';
import {Typography} from '../../../components/Typography';
import {styles} from './DashboardDateFilter.styles';
import {ModeToggle} from './date-filter/ModeToggle';
import {MonthYearPickerGroup} from './date-filter/MonthYearPickerGroup';
import {useDashboardDateFilterViewModel} from '../viewmodel/useDashboardDateFilterViewModel';
import {DateSelection} from './date-filter/types';
import {useUserPrefs} from '../../../context/UserPrefContext';
import {monthRange} from '../../../repositories/analyticsRepository';

export type {DateSelection} from './date-filter/types';

interface Props {
  selection: DateSelection;
  earliestYear: number;
  onChange: (selection: DateSelection) => void;
}

export const DashboardDateFilter: React.FC<Props> = ({selection, earliestYear, onChange}) => {
  const vm = useDashboardDateFilterViewModel({selection, onChange});
  const {settings} = useUserPrefs();

  const rangeLabel = settings.pay_cycle_day !== null && selection.mode === 'single'
    ? monthRange(selection.year, selection.month, settings.pay_cycle_day).label
    : null;

  return (
    <View style={styles.container}>
      <ModeToggle selectedMode={selection.mode} onToggle={vm.handleModeToggle} />

      {selection.mode === 'single' ? (
        <View style={styles.singlePickerContainer}>
          <MonthYearPickerGroup
            month={selection.month}
            year={selection.year}
            earliestYear={earliestYear}
            maxYear={vm.currentYear}
            maxMonth={vm.currentMonth}
            onMonthChange={month => vm.handleSingleChange('month', month)}
            onYearChange={year => vm.handleSingleChange('year', year)}
          />
        </View>
      ) : (
        <View style={styles.rangeRow}>
          <MonthYearPickerGroup
            month={selection.startMonth}
            year={selection.startYear}
            earliestYear={earliestYear}
            maxYear={selection.endYear}
            maxMonth={selection.endMonth}
            label="FROM"
            onMonthChange={month => vm.handleRangeChange('startMonth', month)}
            onYearChange={year => vm.handleRangeChange('startYear', year)}
          />
          <Typography variant="body" color="textMuted" style={styles.rangeSeparator}>
            -
          </Typography>
          <MonthYearPickerGroup
            month={selection.endMonth}
            year={selection.endYear}
            earliestYear={earliestYear}
            minYear={selection.startYear}
            minMonth={selection.startMonth}
            maxYear={vm.currentYear}
            maxMonth={vm.currentMonth}
            label="TO"
            onMonthChange={month => vm.handleRangeChange('endMonth', month)}
            onYearChange={year => vm.handleRangeChange('endYear', year)}
          />
        </View>
      )}
    </View>
  );
};
