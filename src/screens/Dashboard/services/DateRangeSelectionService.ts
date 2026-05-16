import {DateSelection, DateMode} from '../components/date-filter/types';

export class DateRangeSelectionService {
  private readonly currentYear: number;
  private readonly currentMonth: number;

  constructor(now = new Date()) {
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
  }

  public toggleMode(selection: DateSelection, mode: DateMode): DateSelection {
    if (mode === selection.mode) {
      return selection;
    }

    if (mode === 'single') {
      const year = selection.mode === 'range' ? selection.startYear : this.currentYear;
      const month = selection.mode === 'range' ? selection.startMonth : this.currentMonth;
      return {mode: 'single', year, month};
    }

    const startYear = selection.mode === 'single' ? selection.year : this.currentYear;
    const startMonth = selection.mode === 'single' ? selection.month : this.currentMonth;

    return {
      mode: 'range',
      startYear,
      startMonth,
      endYear: this.currentYear,
      endMonth: this.currentMonth,
    };
  }

  public updateSingle(selection: DateSelection, field: 'year' | 'month', value: number): DateSelection {
    if (selection.mode !== 'single') {
      return selection;
    }

    return {...selection, [field]: value};
  }

  public updateRange(
    selection: DateSelection,
    field: 'startYear' | 'startMonth' | 'endYear' | 'endMonth',
    value: number,
  ): DateSelection {
    if (selection.mode !== 'range') {
      return selection;
    }

    const next = {...selection, [field]: value};
    const startTs = next.startYear * 12 + next.startMonth;
    const endTs = next.endYear * 12 + next.endMonth;

    if (endTs < startTs) {
      next.endYear = next.startYear;
      next.endMonth = next.startMonth;
    }

    return next;
  }

  public getCurrentYear(): number {
    return this.currentYear;
  }

  public getCurrentMonth(): number {
    return this.currentMonth;
  }
}

export const dateRangeSelectionService = new DateRangeSelectionService();
