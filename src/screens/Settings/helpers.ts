export const MONTH_NAMES = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];

export function prevMonth(year: number, month: number) {
  return month === 1 ? {year: year - 1, month: 12} : {year, month: month - 1};
}

export function nextMonth(year: number, month: number) {
  return month === 12 ? {year: year + 1, month: 1} : {year, month: month + 1};
}
