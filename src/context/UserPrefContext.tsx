import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import {UserSettings} from '../types';
import {userPrefRepository} from '../repositories/userPrefRepository';

interface UserPrefContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  getPeriodBounds: (date: Date) => {startDate: string; endDate: string};
  loading: boolean;
}

const UserPrefContext = createContext<UserPrefContextType | undefined>(undefined);

export const UserPrefProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [settings, setSettings] = useState<UserSettings>({
    pay_cycle_day: null,
    transaction_scope_account_id: null,
    widget_account_id: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await userPrefRepository.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch user settings', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    await userPrefRepository.updateSettings(newSettings);
    await fetchSettings();
  };

  const toDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getPeriodBounds = (date: Date): {startDate: string; endDate: string} => {
    const {pay_cycle_day} = settings;

    if (pay_cycle_day === null) {
      // Standard calendar month
      const year = date.getFullYear();
      const month = date.getMonth();
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);
      return {
        startDate: toDateStr(first),
        endDate: toDateStr(last),
      };
    }

    // Pay cycle calculation
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth();
    const currentDay = date.getDate();

    let start: Date;
    let end: Date;

    // Helper to get clamped date
    const getClampedDate = (y: number, m: number, d: number) => {
      const lastDayOfMonth = new Date(y, m + 1, 0).getDate();
      return new Date(y, m, Math.min(d, lastDayOfMonth));
    };

    const paydayThisMonth = getClampedDate(currentYear, currentMonth, pay_cycle_day);

    if (currentDay >= paydayThisMonth.getDate()) {
      // We are in the cycle starting this month
      start = paydayThisMonth;
      end = getClampedDate(currentYear, currentMonth + 1, pay_cycle_day - 1);
      if (pay_cycle_day === 1) {
          // If payday is 1st, it's just a calendar month but handled by logic above it might be weird
          // Actually if pay_cycle_day is 1, it matches calendar month.
          // But let's handle the "day before" properly.
          // If pay_cycle_day is 1, end should be last day of current month.
          end = new Date(currentYear, currentMonth + 1, 0);
      }
    } else {
      // We are in the cycle starting last month
      start = getClampedDate(currentYear, currentMonth - 1, pay_cycle_day);
      end = new Date(paydayThisMonth);
      end.setDate(paydayThisMonth.getDate() - 1);
    }

    return {
      startDate: toDateStr(start),
      endDate: toDateStr(end),
    };
  };

  return (
    <UserPrefContext.Provider value={{settings, updateSettings, getPeriodBounds, loading}}>
      {children}
    </UserPrefContext.Provider>
  );
};

export const useUserPrefs = () => {
  const context = useContext(UserPrefContext);
  if (context === undefined) {
    throw new Error('useUserPrefs must be used within a UserPrefProvider');
  }
  return context;
};
