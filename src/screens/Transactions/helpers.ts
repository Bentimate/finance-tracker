import {Transaction} from '../../types';

export interface TransactionSection {
  title: string;
  data: Transaction[];
}

export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Returns Monday and Sunday of the ISO week containing `date`. */
export function getISOWeekBounds(date: Date): {start: string; end: string} {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {start: toDateStr(monday), end: toDateStr(sunday)};
}

export function groupByDate(transactions: Transaction[]): TransactionSection[] {
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach(tx => {
    const date = tx.date.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
  });
  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map(date => ({title: date, data: groups[date]}));
}

export function formatDateLabel(dateStr: string): string {
  const today = new Date();
  const todayStr = toDateStr(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = toDateStr(yesterday);

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';

  // Parse as local date to avoid timezone offset shifting the day
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export const formatDisplayAmount = (raw: string): string => {
  if (!raw) return '$0.00';
  const hasSign = raw.startsWith('-') || raw.startsWith('+');
  const sign = hasSign ? raw[0] : '';
  const numericPart = hasSign ? raw.slice(1) : raw;
  if (!numericPart) return `${sign}$0.00`;

  const parts = numericPart.split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decPart = parts.length > 1 ? parts[1].slice(0, 2) : '';

  if (parts.length > 1) {
    return `${sign}$${intPart}.${decPart}`;
  }
  return `${sign}$${intPart}`;
};
