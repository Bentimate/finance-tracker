import {useCallback} from 'react';
import {DateSelection, DateMode} from '../components/date-filter/types';
import {dateRangeSelectionService} from '../services/DateRangeSelectionService';

interface Input {
  selection: DateSelection;
  onChange: (selection: DateSelection) => void;
}

export function useDashboardDateFilterViewModel({selection, onChange}: Input) {
  const handleModeToggle = useCallback(
    (mode: DateMode) => {
      onChange(dateRangeSelectionService.toggleMode(selection, mode));
    },
    [selection, onChange],
  );

  const handleSingleChange = useCallback(
    (field: 'year' | 'month', value: number) => {
      onChange(dateRangeSelectionService.updateSingle(selection, field, value));
    },
    [selection, onChange],
  );

  const handleRangeChange = useCallback(
    (field: 'startYear' | 'startMonth' | 'endYear' | 'endMonth', value: number) => {
      onChange(dateRangeSelectionService.updateRange(selection, field, value));
    },
    [selection, onChange],
  );

  return {
    currentYear: dateRangeSelectionService.getCurrentYear(),
    currentMonth: dateRangeSelectionService.getCurrentMonth(),
    handleModeToggle,
    handleSingleChange,
    handleRangeChange,
  };
}
