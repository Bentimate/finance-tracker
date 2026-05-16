import {RefObject, useCallback, useMemo, useRef, useState} from 'react';
import {Alert, DeviceEventEmitter, Keyboard, Platform, View} from 'react-native';
import {DateTimePickerAndroid, DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {useFocusEffect, useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {TransactionStackParamList} from '../../../navigation/types';
import {ParentCategory} from '../../../types';
import {categoryRepository} from '../../../repositories/categoryRepository';
import {transactionRepository} from '../../../repositories/transactionRepository';
import {formatDisplayAmount} from '../helpers';
import {categorySelectionService} from '../../../components/services/CategorySelectionService';
import {transactionFormService} from '../services/TransactionFormService';

type NavigationProp = NativeStackNavigationProp<TransactionStackParamList, 'TransactionForm'>;
type FormRouteProp = RouteProp<TransactionStackParamList, 'TransactionForm'>;

export interface TransactionFormViewModel {
  transactionId?: number;
  amount: string;
  note: string;
  categoryId: number | null;
  date: string;
  selectedDate: Date;
  displayAmount: string;
  isExpenseInput: boolean;
  selectedDisplay: {label: string; color: string; icon: string | null} | null;
  categories: ParentCategory[];
  loading: boolean;
  isCategoryModalVisible: boolean;
  isDatePickerVisible: boolean;
  isAmountKeypadVisible: boolean;
  amountLayout: {y: number; height: number} | null;
  amountContainerRef: RefObject<View | null>;
  setNote: (next: string) => void;
  setCategoryModalVisible: (visible: boolean) => void;
  setDatePickerVisible: (visible: boolean) => void;
  setAmountKeypadVisible: (visible: boolean) => void;
  onAmountContainerLayout: () => void;
  closeAmountKeypad: () => void;
  openDatePicker: () => void;
  handleDateChange: (_event: DateTimePickerEvent, pickedDate?: Date) => void;
  appendDigit: (digit: string) => void;
  appendDecimal: () => void;
  toggleSign: () => void;
  backspace: () => void;
  clearAmount: () => void;
  handleSave: () => Promise<void>;
  handleDelete: () => void;
  onAmountFocus: () => void;
  onCategorySelect: (id: number) => void;
}

export function useTransactionFormViewModel(): TransactionFormViewModel {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FormRouteProp>();
  const transactionId = route.params?.transactionId;

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString());
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isAmountKeypadVisible, setAmountKeypadVisible] = useState(false);
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

        if (transactionId) {
          const tx = await transactionRepository.getById(transactionId);
          if (tx && isMounted) {
            setAmount(tx.type === 'expense' ? `-${tx.amount}` : tx.amount.toString());
            setCategoryId(tx.category_id);
            setNote(tx.note || '');
            setDate(tx.date);
          }
        }
      };

      void loadData();
      return () => {
        isMounted = false;
      };
    }, [transactionId]),
  );

  const selectedDisplay = useMemo(
    () => categorySelectionService.resolveSelectedDisplay(categories, categoryId),
    [categories, categoryId],
  );

  const selectedDate = new Date(date);
  const isExpenseInput = amount.trim().startsWith('-');
  const displayAmount = formatDisplayAmount(amount);

  const onAmountContainerLayout = useCallback(() => {
    amountContainerRef.current?.measureInWindow((_x, y, _width, height) => {
      setAmountLayout({y, height});
    });
  }, [amountContainerRef]);

  const closeAmountKeypad = useCallback(() => {
    setAmountKeypadVisible(false);
  }, []);

  const handleDateChange = useCallback((_event: DateTimePickerEvent, pickedDate?: Date) => {
    if (pickedDate) {
      setDate(pickedDate.toISOString());
    }
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
      const nextNumericPart = numericPart === '0' ? digit : `${numericPart}${digit}`;
      return `${sign}${nextNumericPart}`;
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
      if (!numericPart) {
        return `${sign}0.`;
      }
      return `${sign}${numericPart}.`;
    });
  }, []);

  const toggleSign = useCallback(() => {
    setAmount(currentAmount => {
      const trimmed = currentAmount.trim();
      if (!trimmed) {
        return '-';
      }
      if (trimmed.startsWith('-')) {
        return trimmed.slice(1);
      }
      if (trimmed.startsWith('+')) {
        return `-${trimmed.slice(1)}`;
      }
      return `-${trimmed}`;
    });
  }, []);

  const backspace = useCallback(() => {
    setAmount(currentAmount => {
      const trimmed = currentAmount.trim();
      if (!trimmed) {
        return '';
      }
      const nextAmount = trimmed.slice(0, -1);
      if (nextAmount === '-' || nextAmount === '+') {
        return '';
      }
      return nextAmount;
    });
  }, []);

  const clearAmount = useCallback(() => setAmount(''), []);

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

    const payload = transactionFormService.buildPayload({
      normalizedAmount: amountResult.value,
      categoryId: categoryId as number,
      note,
      date,
    });

    setLoading(true);
    try {
      if (transactionId) {
        await transactionRepository.update(transactionId, payload);
      } else {
        await transactionRepository.create(payload);
      }
      DeviceEventEmitter.emit('AppRefresh');
      navigation.goBack();
    } catch (_error) {
      Alert.alert('Error', 'Failed to save transaction.');
    } finally {
      setLoading(false);
    }
  }, [amount, categoryId, note, date, transactionId, navigation]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (transactionId) {
            await transactionRepository.delete(transactionId);
            DeviceEventEmitter.emit('AppRefresh');
            navigation.goBack();
          }
        },
      },
    ]);
  }, [transactionId, navigation]);

  const openDatePicker = useCallback(() => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        onChange: handleDateChange,
        mode: 'date',
        is24Hour: true,
      });
      return;
    }
    setDatePickerVisible(true);
  }, [selectedDate, handleDateChange]);

  const onAmountFocus = useCallback(() => {
    Keyboard.dismiss();
    setCategoryModalVisible(false);
    setDatePickerVisible(false);
    setAmountKeypadVisible(true);
  }, []);

  const onCategorySelect = useCallback((id: number) => {
    setCategoryId(id);
    setCategoryModalVisible(false);
  }, []);

  return {
    transactionId,
    amount,
    note,
    categoryId,
    date,
    selectedDate,
    displayAmount,
    isExpenseInput,
    selectedDisplay,
    categories,
    loading,
    isCategoryModalVisible,
    isDatePickerVisible,
    isAmountKeypadVisible,
    amountLayout,
    amountContainerRef,
    setNote,
    setCategoryModalVisible,
    setDatePickerVisible,
    setAmountKeypadVisible,
    onAmountContainerLayout,
    closeAmountKeypad,
    openDatePicker,
    handleDateChange,
    appendDigit,
    appendDecimal,
    toggleSign,
    backspace,
    clearAmount,
    handleSave,
    handleDelete,
    onAmountFocus,
    onCategorySelect,
  };
}
