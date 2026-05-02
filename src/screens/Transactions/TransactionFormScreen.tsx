import React, {useState, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Keyboard,
  Platform,
  TextStyle,
  DeviceEventEmitter,
} from 'react-native';
import {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {useNavigation, useRoute, RouteProp, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {theme} from '../../theme';
import {Typography} from '../../components/Typography';
import {Button} from '../../components/Button';
import {Input} from '../../components/Input';
import {TransactionStackParamList} from '../../navigation/types';
import {Category} from '../../types';
import {categoryRepository} from '../../repositories/categoryRepository';
import {transactionRepository} from '../../repositories/transactionRepository';
import {styles} from './styles/TransactionFormScreen.styles';

import {CategoryPickerModal} from '../../components/CategoryPickerModal';
import {AmountKeypad} from './components/AmountKeypad';
import {DatePickerModal} from './components/DatePickerModal';
import {formatDisplayAmount} from './helpers';
import {Screen} from '../../components/Screen';

type NavigationProp = NativeStackNavigationProp<TransactionStackParamList, 'TransactionForm'>;
type FormRouteProp = RouteProp<TransactionStackParamList, 'TransactionForm'>;

const TransactionFormScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FormRouteProp>();
  const {transactionId} = route.params;

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString());

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isAmountKeypadVisible, setAmountKeypadVisible] = useState(false);
  const [amountLayout, setAmountLayout] = useState<{y: number; height: number} | null>(null);
  const [loading, setLoading] = useState(false);

  const amountContainerRef = React.useRef<View>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadData = async () => {
        const cats = await categoryRepository.getAll();
        if (!isMounted) return;
        setCategories(cats);

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

      loadData();
      return () => { isMounted = false; };
    }, [transactionId])
  );

  const selectedCategory = categories.find(c => c.id === categoryId);
  const selectedDate = new Date(date);
  const isExpenseInput = amount.trim().startsWith('-');
  const displayAmount = formatDisplayAmount(amount);

  const onAmountContainerLayout = () => {
    // We use measureInWindow to get the absolute position relative to the screen.
    // This is useful for placing a replica in a Modal which also covers the whole screen.
    amountContainerRef.current?.measureInWindow((_x, y, _width, height) => {
      // In some Android environments, measureInWindow includes the status bar,
      // but absolute positioning in a Modal might be relative to the viewable area.
      // If it's slightly too far up, we might need a small adjustment.
      setAmountLayout({y, height});
    });
  };

  const closeAmountKeypad = () => {
    setAmountKeypadVisible(false);
  };

  const handleDateChange = (_event: DateTimePickerEvent, pickedDate?: Date) => {
    if (pickedDate) {
      setDate(pickedDate.toISOString());
    }
  };

  const appendDigit = (digit: string) => {
    setAmount((currentAmount) => {
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
  };

  const appendDecimal = () => {
    setAmount((currentAmount) => {
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
  };

  const toggleSign = () => {
    setAmount((currentAmount) => {
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
  };

  const backspace = () => {
    setAmount((currentAmount) => {
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
  };

  const handleSave = async () => {
    const trimmed = amount.trim();
    const hasNegativeSign = trimmed.startsWith('-');
    const hasPositiveSign = trimmed.startsWith('+');
    const numericPart = (hasNegativeSign || hasPositiveSign) ? trimmed.slice(1) : trimmed;
    const parsed = parseFloat(numericPart);

    if (isNaN(parsed) || parsed === 0) {
      Alert.alert('Invalid Amount', 'Enter a non-zero amount like 120 or -120.');
      return;
    }

    const normalized = {
      amount: Math.abs(parsed),
      type: hasNegativeSign ? 'expense' : 'income' as 'income' | 'expense'
    };

    if (!categoryId) {
      Alert.alert('Category Required', 'Please select a category.');
      return;
    }

    const data = {
      amount: normalized.amount,
      type: normalized.type,
      category_id: categoryId,
      note: note.trim() || undefined,
      date,
    };

    setLoading(true);
    try {
      if (transactionId) {
        await transactionRepository.update(transactionId, data as any);
      } else {
        await transactionRepository.create(data);
      }
      DeviceEventEmitter.emit('AppRefresh');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
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
      ],
    );
  };

  const openDatePicker = () => {
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
  };

  return (
    <Screen
      edges={[]}
      overlays={
        <AmountKeypad
          visible={isAmountKeypadVisible}
          value={displayAmount}
          isExpense={isExpenseInput}
          topOffset={amountLayout?.y + 6 ?? 0}
          onClose={closeAmountKeypad}
          onAppendDigit={appendDigit}
          onAppendDecimal={appendDecimal}
          onToggleSign={toggleSign}
          onBackspace={backspace}
          onClear={() => setAmount('')}
          onDone={closeAmountKeypad}
        />
      }>
      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{paddingBottom: isAmountKeypadVisible ? 300 : 0}} // Avoid overlapping with keypad
      >
        <View
          ref={amountContainerRef}
          style={styles.amountContainer}
          onLayout={onAmountContainerLayout}
        >
          <TextInput
            style={[
              styles.amountInput as TextStyle,
              {color: isExpenseInput ? theme.colors.error : theme.colors.success}
            ]}
            value={displayAmount}
            onChangeText={() => {}}
            editable
            showSoftInputOnFocus={false}
            contextMenuHidden
            caretHidden
            placeholder="$0.00"
            placeholderTextColor={theme.colors.textMuted}
            onFocus={() => {
              Keyboard.dismiss();
              setCategoryModalVisible(false);
              setDatePickerVisible(false);
              setAmountKeypadVisible(true);
            }}
          />
          <Typography variant="caption" color="textMuted" style={styles.amountLabel}>
            press +/- to toggle between expense and income
          </Typography>
        </View>

        <View style={styles.section}>
          <Typography variant="label" color="textSecondary" style={{marginBottom: 8}}>
            CATEGORY
          </Typography>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => {
              closeAmountKeypad();
              setCategoryModalVisible(true);
            }}>
            {selectedCategory ? (
              <>
                <View style={[styles.categoryDot, {backgroundColor: selectedCategory.color}]} />
                <Typography variant="body">{selectedCategory.name}</Typography>
              </>
            ) : (
              <Typography variant="body" color="textMuted">Select Category</Typography>
            )}
          </TouchableOpacity>
        </View>

        <Input
          label="NOTES"
          value={note}
          onChangeText={setNote}
          placeholder="What was this for?"
          multiline
          onFocus={closeAmountKeypad}
        />

        <View style={styles.section}>
          <Typography variant="label" color="textSecondary" style={{marginBottom: 8}}>
            DATE
          </Typography>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => {
              closeAmountKeypad();
              openDatePicker();
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Select transaction date">
            <Typography variant="body" style={styles.dateValue}>
              {selectedDate.toLocaleDateString()}
            </Typography>
            <View style={styles.dateHintContainer}>
              <MaterialIcon name="calendar-month" size={24} color={theme.colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {transactionId && (
          <Button
            title="Delete"
            variant="outline"
            onPress={handleDelete}
            style={{flex: 1, borderColor: theme.colors.error}}
            textStyle={{color: theme.colors.error}}
          />
        )}
        <Button
          title={transactionId ? 'Update' : 'Save Transaction'}
          onPress={handleSave}
          loading={loading}
          style={{flex: 2}}
        />
      </View>

      <CategoryPickerModal
        visible={isCategoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        categories={categories}
        selectedCategoryId={categoryId}
        onSelectCategory={(id) => {
          setCategoryId(id);
          setCategoryModalVisible(false);
        }}
      />

      <DatePickerModal
        visible={isDatePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        date={selectedDate}
        onChange={handleDateChange}
      />
    </Screen>
  );
};

export default TransactionFormScreen;
