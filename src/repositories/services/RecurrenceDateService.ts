import {RecurrenceFrequency} from '../../types';

const DAYS_IN_WEEK = 7;
const MONTHS_IN_YEAR = 12;
const YEARLY_INTERVAL_MONTH_MULTIPLIER = 100;

export class RecurrenceDateService {
  public getOccurrenceDateString(date: Date): string {
    return this.toDateOnlyIso(date);
  }

  public normalizeNextOccurrence(input: {
    frequency: RecurrenceFrequency;
    intervalValue: number | null;
    nextOccurrence: string;
    now: Date;
  }): string {
    let candidate = this.startOfLocalDay(new Date(input.nextOccurrence));
    const today = this.startOfLocalDay(input.now);

    if (candidate >= today && this.matchesRule(candidate, input.frequency, input.intervalValue)) {
      return this.toDateOnlyIso(candidate);
    }

    candidate = candidate < today ? today : candidate;
    return this.toDateOnlyIso(this.findNextOnOrAfter(candidate, input.frequency, input.intervalValue));
  }

  public advanceAfterOccurrence(input: {
    frequency: RecurrenceFrequency;
    intervalValue: number | null;
    occurrence: string;
  }): string {
    const occurrence = this.startOfLocalDay(new Date(input.occurrence));

    switch (input.frequency) {
      case 'daily':
        return this.toDateOnlyIso(this.addDays(occurrence, 1));
      case 'weekly':
        return this.toDateOnlyIso(this.addDays(occurrence, DAYS_IN_WEEK));
      case 'monthly':
        return this.toDateOnlyIso(this.nextMonthlyDate(occurrence, this.getMonthlyDay(input.intervalValue)));
      case 'yearly':
        return this.toDateOnlyIso(this.nextYearlyDate(occurrence, this.getYearlyMonthDay(input.intervalValue)));
    }
  }

  public defaultIntervalValue(frequency: RecurrenceFrequency, date: Date): number | null {
    switch (frequency) {
      case 'daily':
        return null;
      case 'weekly':
        return date.getDay();
      case 'monthly':
        return date.getDate();
      case 'yearly':
        return (date.getMonth() + 1) * YEARLY_INTERVAL_MONTH_MULTIPLIER + date.getDate();
    }
  }

  public validateIntervalValue(frequency: RecurrenceFrequency, intervalValue: number | null): boolean {
    switch (frequency) {
      case 'daily':
        return intervalValue === null;
      case 'weekly':
        return intervalValue !== null && intervalValue >= 0 && intervalValue < DAYS_IN_WEEK;
      case 'monthly':
        return intervalValue !== null && intervalValue >= 1 && intervalValue <= 31;
      case 'yearly': {
        if (intervalValue === null) {
          return false;
        }
        const {month, day} = this.getYearlyMonthDay(intervalValue);
        return month >= 1 && month <= MONTHS_IN_YEAR && day >= 1 && day <= 31;
      }
    }
  }

  private findNextOnOrAfter(
    date: Date,
    frequency: RecurrenceFrequency,
    intervalValue: number | null,
  ): Date {
    switch (frequency) {
      case 'daily':
        return this.startOfLocalDay(date);
      case 'weekly': {
        const targetDay = this.getWeeklyDay(intervalValue);
        const diff = (targetDay - date.getDay() + DAYS_IN_WEEK) % DAYS_IN_WEEK;
        return this.addDays(this.startOfLocalDay(date), diff);
      }
      case 'monthly': {
        const day = this.getMonthlyDay(intervalValue);
        const candidate = this.clampedDate(date.getFullYear(), date.getMonth() + 1, day);
        return candidate >= this.startOfLocalDay(date)
          ? candidate
          : this.clampedDate(date.getFullYear(), date.getMonth() + 2, day);
      }
      case 'yearly': {
        const {month, day} = this.getYearlyMonthDay(intervalValue);
        const candidate = this.clampedDate(date.getFullYear(), month, day);
        return candidate >= this.startOfLocalDay(date)
          ? candidate
          : this.clampedDate(date.getFullYear() + 1, month, day);
      }
    }
  }

  private matchesRule(
    date: Date,
    frequency: RecurrenceFrequency,
    intervalValue: number | null,
  ): boolean {
    switch (frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return date.getDay() === this.getWeeklyDay(intervalValue);
      case 'monthly':
        return date.getDate() === this.clampedDay(date.getFullYear(), date.getMonth() + 1, this.getMonthlyDay(intervalValue));
      case 'yearly': {
        const {month, day} = this.getYearlyMonthDay(intervalValue);
        return date.getMonth() + 1 === month
          && date.getDate() === this.clampedDay(date.getFullYear(), month, day);
      }
    }
  }

  private nextMonthlyDate(date: Date, day: number): Date {
    return this.clampedDate(date.getFullYear(), date.getMonth() + 2, day);
  }

  private nextYearlyDate(date: Date, value: {month: number; day: number}): Date {
    return this.clampedDate(date.getFullYear() + 1, value.month, value.day);
  }

  private getWeeklyDay(intervalValue: number | null): number {
    return intervalValue ?? 0;
  }

  private getMonthlyDay(intervalValue: number | null): number {
    return intervalValue ?? 1;
  }

  private getYearlyMonthDay(intervalValue: number | null): {month: number; day: number} {
    const value = intervalValue ?? 101;
    return {
      month: Math.floor(value / YEARLY_INTERVAL_MONTH_MULTIPLIER),
      day: value % YEARLY_INTERVAL_MONTH_MULTIPLIER,
    };
  }

  private clampedDate(year: number, oneBasedMonth: number, day: number): Date {
    const normalized = new Date(year, oneBasedMonth - 1, 1);
    const normalizedYear = normalized.getFullYear();
    const normalizedMonth = normalized.getMonth();
    return new Date(
      normalizedYear,
      normalizedMonth,
      this.clampedDay(normalizedYear, normalizedMonth + 1, day),
    );
  }

  private clampedDay(year: number, oneBasedMonth: number, day: number): number {
    const lastDay = new Date(year, oneBasedMonth, 0).getDate();
    return Math.min(day, lastDay);
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return this.startOfLocalDay(next);
  }

  private startOfLocalDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private toDateOnlyIso(date: Date): string {
    return this.startOfLocalDay(date).toISOString();
  }
}

export const recurrenceDateService = new RecurrenceDateService();
