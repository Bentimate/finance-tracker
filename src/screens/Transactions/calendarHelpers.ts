export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Returns an array of days to display in a 7-column calendar grid for the given month.
 * Includes padding days from previous and next months to fill the rows.
 */
export function getCalendarGrid(year: number, month: number): CalendarDay[] {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);

  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Padding days from previous month
  // 0 = Sunday, 1 = Monday...
  // We want Monday as the first day of the week if possible, or Sunday.
  // Let's stick to Sunday as start of week for simplicity (default JS getDay())
  const startPadding = firstDayOfMonth.getDay();
  const prevMonthLastDay = new Date(year, month - 1, 0);

  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(year, month - 2, prevMonthLastDay.getDate() - i);
    days.push({
      date: d,
      isCurrentMonth: false,
      isToday: d.getTime() === today.getTime(),
    });
  }

  // Days of current month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month - 1, i);
    days.push({
      date: d,
      isCurrentMonth: true,
      isToday: d.getTime() === today.getTime(),
    });
  }

  // Padding days from next month to fill to a multiple of 7
  const endPadding = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= endPadding; i++) {
    const d = new Date(year, month, i);
    days.push({
      date: d,
      isCurrentMonth: false,
      isToday: d.getTime() === today.getTime(),
    });
  }

  return days;
}

export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
