import {dateRangeSelectionService} from '../src/screens/Dashboard/services/DateRangeSelectionService';
import {DateSelection} from '../src/screens/Dashboard/components/date-filter/types';

describe('DateRangeSelectionService', () => {
  test('toggles single to range', () => {
    const single: DateSelection = {mode: 'single', year: 2026, month: 4};
    const next = dateRangeSelectionService.toggleMode(single, 'range');
    expect(next.mode).toBe('range');
    if (next.mode === 'range') {
      expect(next.startYear).toBe(2026);
      expect(next.startMonth).toBe(4);
    }
  });

  test('clamps range when end before start', () => {
    const range: DateSelection = {
      mode: 'range',
      startYear: 2026,
      startMonth: 5,
      endYear: 2026,
      endMonth: 6,
    };
    const next = dateRangeSelectionService.updateRange(range, 'endMonth', 4);
    if (next.mode === 'range') {
      expect(next.endMonth).toBe(next.startMonth);
      expect(next.endYear).toBe(next.startYear);
    }
  });
});
