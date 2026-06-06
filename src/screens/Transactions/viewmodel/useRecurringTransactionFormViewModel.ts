import {RefObject, useCallback, useMemo, useRef, useState} from 'react';
import {Alert, DeviceEventEmitter, Keyboard, Platform, View} from 'react-native';
import {DateTimePickerAndroid, DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {RouteProp, useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {ParentCategory, RecurrenceFrequency} from '../../../types';
import {TransactionStackParamList} from '../../../navigation/types';
import {categoryRepository} from '../../../repositories/categoryRepository';
import {recurringTransactionRepository} from '../../../repositories/recurringTransactionRepository';
import {recurrenceDateService} from '../../../repositories/services/RecurrenceDateService';
import {categorySelectionService} from '../../../components/services/CategorySelectionService';
import {formatDisplayAmount} from '../helpers';
import {transactionFormService} from '../services/TransactionFormService';

type NavigationProp = NativeStackNavigationProp<TransactionStackParamList, 'RecurringTransactionForm'>;
type FormRouteProp = RouteProp<TransactionStackParamList, 'RecurringTransactionForm'>;
type PickerTarget = 'nextOccurrence' | 'yearlyDate';

export interface RecurringTransactionFormViewModel {
  recurringTransactionId?: number;
  note: string;
  categoryId: number | null;
  categories: ParentCategory[];
  selectedDisplay: {label: string; color: string; icon: string | null} | null;
  displayAmount: string;
  isExpenseInput: boolean;
  nextOccurrence: Date;
  frequency: RecurrenceFrequency;
  weeklyDay: number;
  monthlyDay: string;
  yearlyDate: Date;
  loading: boolean;
  isAmountKeypadVisible: boolean;
  isCategoryModalVisible: boolean;
  isDatePickerVisible: boolean;
  datePickerDate: Date;
  amountLayout: {y: number; height: number} | null;
  amountContainerRef: RefObject<View | null>;
  setNote: (next: string) => void;
  setCategoryModalVisible: (visible: boolean) => void;
  setDatePickerVisible: (visible: boolean) => void;
  onAmountContainerLayout: () => void;
  closeAmountKeypad: () => void;
  onAmountFocus: () => void;
  appendDigit: (digit: string) => void;
  appendDecimal: () => void;
  toggleSign: () => void;
  backspace: () => void;
  clearAmount: () => void;
  onCategorySelect: (id: number) => void;
  openNextOccurrencePicker: () => void;
  openYearlyDatePicker: () => void;
  handleDateChange: (event: DateTimePickerEvent, pickedDate?: Date) => void;
  setFrequency: (frequency: RecurrenceFrequency) => void;
  setWeeklyDay: (day: number) => void;
  setMonthlyDay: (day: string) => void;
  handleSave: () => Promise<void>;
  handleDelete: () => void;
}

export function useRecurringTransactionFormViewModel(): RecurringTransactionFormViewModel {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FormRouteProp>();
  const recurringTransactionId = route.params?.recurringTransactionId;

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [nextOccurrence, setNextOccurrence] = useState(() => startOfLocalDay(new Date()));
  const [frequency, setFrequencyState] = useState<RecurrenceFrequency>('monthly');
  const [weeklyDay, setWeeklyDay] = useState(new Date().getDay());
  const [monthlyDay, setMonthlyDay] = useState(String(new Date().getDate()));
  const [yearlyDate, setYearlyDate] = useState(() => startOfLocalDay(new Date()));
  const [isAmountKeypadVisible, setAmountKeypadVisible] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>('nextOccurrence');
  const [amountLayout, setAmountLayout] = useState<{y: number; height: number} | null>(null);
  const [loading, setLoading] = useState(false);

  const amountContainerRef = useRef<View | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadData = async () => {
        const nested = await categoryRepository.getAllNested();
        if (!isMounted) {
          return;
        }
        setCategories(nested);

        if (recurringTransactionId) {
          const item = await recurringTransactionRepository.getById(recurringTransactionId);
          if (item && isMounted) {
            const occurrence = new Date(item.next_occurrence);
            setAmount(item.type === 'expense' ? `-${item.amount}` : item.amount.toString());
            setCategoryId(item.category_id);
            setNote(item.note ?? '');
            setNextOccurrence(occurrence);
            setFrequencyState(item.frequency);
            hydrateIntervalState(item.frequency, item.interval_value, occurrence);
          }
        }
      };

      loadData();
      return () => {
        isMounted = false;
      };
    }, [recurringTransactionId]),
  );

  const selectedDisplay = useMemo(
    () => categorySelectionService.resolveSelectedDisplay(categories, categoryId),
    [categories, categoryId],
  );

  const displayAmount = formatDisplayAmount(amount);
  const isExpenseInput = amount.trim().startsWith('-');

  const onAmountContainerLayout = useCallback(() => {
    amountContainerRef.current?.measureInWindow((_x, y, _width, height) => {
      setAmountLayout({y, height});
    });
  }, []);

  const closeAmountKeypad = useCallback(() => {
    setAmountKeypadVisible(false);
  }, []);

  const onAmountFocus = useCallback(() => {
    Keyboard.dismiss();
    setCategoryModalVisible(false);
    setDatePickerVisible(false);
    setAmountKeypadVisible(true);
  }, []);

  const appendDigit = useCallback((digit: string) => {
    setAmount(currentAmount => {
      const trimmed = currentAmount.trim();
      if (!trimmed) {
        return digit;
      }
      const hasSign = trimmed.startsWith('-') || trimmed.startsWith('+');
      const sign = hasSign ? trimmed[0] : '';
      const numericPart = hasSign ? trimmed.slice(1) : trimmed;
      return `${sign}${numericPart === '0' ? digit : `${numericPart}${digit}`}`;
    });
  }, []);

  const appendDecimal = useCallback(() => {
    setAmount(currentAmount => {
      const trimmed = currentAmount.trim();
      const hasSign = trimmed.startsWith('-') || trimmed.startsWith('+');
      const sign = hasSign ? trimmed[0] : '';
      const numericPart = hasSign ? trimmed.slice(1) : trimmed;
      if (numericPart.includes('.')) {
        return trimmed;
      }
      return `${sign}${numericPart || '0'}.`;
    });
  }, []);

  const toggleSign = useCallback(() => {
    setAmount(currentAmount => {
      const trimmed = currentAmount.trim();
      if (!trimmed) {
        return '-';
      }
      return trimmed.startsWith('-') ? trimmed.slice(1) : `-${trimmed.replace(/^\+/, '')}`;
    });
  }, []);

  const backspace = useCallback(() => {
    setAmount(currentAmount => {
      const next = currentAmount.trim().slice(0, -1);
      return next === '-' || next === '+' ? '' : next;
    });
  }, []);

  const clearAmount = useCallback(() => setAmount(''), []);

  const onCategorySelect = useCallback((id: number) => {
    setCategoryId(id);
    setCategoryModalVisible(false);
  }, []);

  const handlePickedDate = useCallback((target: PickerTarget, pickedDate?: Date) => {
    if (!pickedDate) {
      return;
    }
    const date = startOfLocalDay(pickedDate);
    if (target === 'yearlyDate') {
      setYearlyDate(date);
      setFrequencyState('yearly');
      return;
    }
    setNextOccurrence(date);
  }, []);

  const openPicker = useCallback((target: PickerTarget) => {
    closeAmountKeypad();
    setPickerTarget(target);
    const value = target === 'yearlyDate' ? yearlyDate : nextOccurrence;

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        onChange: (_event, pickedDate) => {
          handlePickedDate(target, pickedDate);
        },
        mode: 'date',
        is24Hour: true,
      });
      return;
    }

    setDatePickerVisible(true);
  }, [closeAmountKeypad, handlePickedDate, nextOccurrence, yearlyDate]);

  const handleDateChange = useCallback((_event: DateTimePickerEvent, pickedDate?: Date) => {
    handlePickedDate(pickerTarget, pickedDate);
  }, [handlePickedDate, pickerTarget]);

  const setFrequency = useCallback((nextFrequency: RecurrenceFrequency) => {
    setFrequencyState(nextFrequency);
    const today = startOfLocalDay(new Date());
    if (nextFrequency === 'weekly') {
      setWeeklyDay(today.getDay());
    }
    if (nextFrequency === 'monthly') {
      setMonthlyDay(String(today.getDate()));
    }
    if (nextFrequency === 'yearly') {
      setYearlyDate(today);
    }
  }, []);

  const handleSave = useCallback(async () => {
    const amountResult = transactionFormService.parseAndNormalizeAmount(amount);
    if (!amountResult.ok) {
      Alert.alert('Invalid Amount', amountResult.message);
      return;
    }

    const categoryValidation = transactionFormService.validateCategory(categoryId);
    if (!categoryValidation.ok) {
      Alert.alert('Category Required', categoryValidation.message);
      return;
    }

    const intervalValue = buildIntervalValue(frequency, weeklyDay, monthlyDay, yearlyDate);
    if (intervalValue === undefined) {
      Alert.alert('Invalid Frequency', 'Please enter a valid recurrence frequency.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: amountResult.value.amount,
        type: amountResult.value.type,
        category_id: categoryId as number,
        note,
        frequency,
        interval_value: intervalValue,
        next_occurrence: recurrenceDateService.getOccurrenceDateString(nextOccurrence),
      };

      if (recurringTransactionId) {
        await recurringTransactionRepository.update(recurringTransactionId, payload);
      } else {
        await recurringTransactionRepository.create(payload);
      }

      DeviceEventEmitter.emit('AppRefresh');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save recurring transaction.');
    } finally {
      setLoading(false);
    }
  }, [
    amount,
    categoryId,
    frequency,
    monthlyDay,
    navigation,
    nextOccurrence,
    note,
    recurringTransactionId,
    weeklyDay,
    yearlyDate,
  ]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Recurrence',
      'Generated transactions will stay the same. Future ones will stop.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (recurringTransactionId) {
              await recurringTransactionRepository.delete(recurringTransactionId);
              DeviceEventEmitter.emit('AppRefresh');
              navigation.goBack();
            }
          },
        },
      ],
    );
  }, [navigation, recurringTransactionId]);

  const hydrateIntervalState = (
    itemFrequency: RecurrenceFrequency,
    intervalValue: number | null,
    occurrence: Date,
  ) => {
    if (itemFrequency === 'weekly') {
      setWeeklyDay(intervalValue ?? occurrence.getDay());
    }
    if (itemFrequency === 'monthly') {
      setMonthlyDay(String(intervalValue ?? occurrence.getDate()));
    }
    if (itemFrequency === 'yearly') {
      const value = intervalValue ?? ((occurrence.getMonth() + 1) * 100 + occurrence.getDate());
      setYearlyDate(new Date(occurrence.getFullYear(), Math.floor(value / 100) - 1, value % 100));
    }
  };

  return {
    recurringTransactionId,
    note,
    categoryId,
    categories,
    selectedDisplay,
    displayAmount,
    isExpenseInput,
    nextOccurrence,
    frequency,
    weeklyDay,
    monthlyDay,
    yearlyDate,
    loading,
    isAmountKeypadVisible,
    isCategoryModalVisible,
    isDatePickerVisible,
    datePickerDate: pickerTarget === 'yearlyDate' ? yearlyDate : nextOccurrence,
    amountLayout,
    amountContainerRef,
    setNote,
    setCategoryModalVisible,
    setDatePickerVisible,
    onAmountContainerLayout,
    closeAmountKeypad,
    onAmountFocus,
    appendDigit,
    appendDecimal,
    toggleSign,
    backspace,
    clearAmount,
    onCategorySelect,
    openNextOccurrencePicker: () => openPicker('nextOccurrence'),
    openYearlyDatePicker: () => openPicker('yearlyDate'),
    handleDateChange,
    setFrequency,
    setWeeklyDay,
    setMonthlyDay,
    handleSave,
    handleDelete,
  };
}

function buildIntervalValue(
  frequency: RecurrenceFrequency,
  weeklyDay: number,
  monthlyDay: string,
  yearlyDate: Date,
): number | null | undefined {
  if (frequency === 'daily') {
    return null;
  }
  if (frequency === 'weekly') {
    return weeklyDay;
  }
  if (frequency === 'monthly') {
    const parsed = parseInt(monthlyDay, 10);
    return parsed >= 1 && parsed <= 31 ? parsed : undefined;
  }
  return (yearlyDate.getMonth() + 1) * 100 + yearlyDate.getDate();
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
