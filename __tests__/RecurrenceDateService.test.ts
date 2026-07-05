import {recurrenceDateService} from '../src/repositories/services/RecurrenceDateService';

describe('RecurrenceDateService', () => {
  it('advances daily recurrences by one day', () => {
    expect(
      recurrenceDateService.advanceAfterOccurrence({
        frequency: 'daily',
        intervalValue: null,
        occurrence: new Date(2026, 0, 1).toISOString(),
      }),
    ).toBe(new Date(2026, 0, 2).toISOString());
  });

  it('advances weekly recurrences by seven days', () => {
    expect(
      recurrenceDateService.advanceAfterOccurrence({
        frequency: 'weekly',
        intervalValue: 1,
        occurrence: new Date(2026, 0, 5).toISOString(),
      }),
    ).toBe(new Date(2026, 0, 12).toISOString());
  });

  it('clamps monthly recurrences for short months', () => {
    expect(
      recurrenceDateService.advanceAfterOccurrence({
        frequency: 'monthly',
        intervalValue: 31,
        occurrence: new Date(2026, 0, 31).toISOString(),
      }),
    ).toBe(new Date(2026, 1, 28).toISOString());
  });

  it('clamps yearly leap-day recurrences for non-leap years', () => {
    expect(
      recurrenceDateService.advanceAfterOccurrence({
        frequency: 'yearly',
        intervalValue: 229,
        occurrence: new Date(2024, 1, 29).toISOString(),
      }),
    ).toBe(new Date(2025, 1, 28).toISOString());
  });

  it('normalizes past next occurrences to the next valid future date', () => {
    expect(
      recurrenceDateService.normalizeNextOccurrence({
        frequency: 'weekly',
        intervalValue: 5,
        nextOccurrence: new Date(2026, 0, 1).toISOString(),
        now: new Date(2026, 0, 7),
      }),
    ).toBe(new Date(2026, 0, 9).toISOString());
  });
});
