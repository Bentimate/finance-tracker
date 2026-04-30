import React, {useState, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Alert,
  Keyboard,
  Platform,
  TextStyle,
  DeviceEventEmitter,
} from 'react-native';
import DateTimePicker, {
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
import {getAllCategories} from '../../repositories/categoryRepository';
import {
  createTransaction,
  updateTransaction,
  getTransactionById,
  deleteTransaction,
} from '../../repositories/transactionRepository';
import {styles} from './styles/TransactionFormScreen.styles';

type NavigationProp = NativeStackNavigationProp<TransactionStackParamList, 'TransactionForm'>;
type FormRouteProp = RouteProp<TransactionStackParamList, 'TransactionForm'>;

const formatDisplayAmount = (raw: string): string => {
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
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadData = async () => {
        const cats = await getAllCategories();
        if (!isMounted) return;
        setCategories(cats);

        if (transactionId) {
          const tx = await getTransactionById(transactionId);
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

  const closeAmountKeypad = () => {
    setAmountKeypadVisible(false);
    Keyboard.dismiss();
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

  const clearAmount = () => {
    setAmount('');
  };

  const doneKeypad = () => {
    closeAmountKeypad();
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
        await updateTransaction(transactionId, data as any);
      } else {
        await createTransaction(data);
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
              await deleteTransaction(transactionId);
              DeviceEventEmitter.emit('AppRefresh');
              navigation.goBack();
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.amountContainer}>
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
              setAmountKeypadVisible(true);
            }}
          />
          <Typography variant="caption" color="textMuted" style={styles.amountLabel}>
            AMOUNT IN SGD
          </Typography>
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
          label="NOTE"
          value={note}
          onChangeText={setNote}
          placeholder="What was this for?"
          multiline
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

      <Modal
        visible={isAmountKeypadVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeAmountKeypad}>
        <View style={styles.amountKeypadModalBackdrop}>
          <TouchableOpacity
            style={styles.amountKeypadBackdropPressable}
            activeOpacity={1}
            onPress={closeAmountKeypad}
          />
          <View style={styles.amountKeypadSheet}>
            <View style={styles.keypadContainer}>
              <View style={styles.keypadGrid}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <TouchableOpacity
                    key={digit}
                    style={styles.keypadKey}
                    onPress={() => appendDigit(digit)}>
                    <Typography variant="h3" style={styles.keypadKeyText}>
                      {digit}
                    </Typography>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.keypadKey} onPress={toggleSign}>
                  <Typography variant="h3" style={styles.keypadKeyText}>
                    +/-
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity style={styles.keypadKey} onPress={() => appendDigit('0')}>
                  <Typography variant="h3" style={styles.keypadKeyText}>
                    0
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity style={styles.keypadKey} onPress={appendDecimal}>
                  <Typography variant="h3" style={styles.keypadKeyText}>
                    .
                  </Typography>
                </TouchableOpacity>
              </View>

              <View style={styles.keypadActionsRow}>
                <TouchableOpacity style={styles.keypadActionKey} onPress={clearAmount}>
                  <Typography variant="label" style={styles.keypadActionText}>
                    Clear
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity style={styles.keypadActionKey} onPress={backspace}>
                  <Typography variant="label" style={styles.keypadActionText}>
                    Backspace
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.keypadActionKey, styles.keypadDoneKey]}
                  onPress={doneKeypad}>
                  <Typography variant="label" style={styles.keypadDoneText}>
                    Done
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isCategoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCategoryModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="h3">Select Category</Typography>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Typography color="primary">Done</Typography>
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.categoryList}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    categoryId === item.id && styles.categoryOptionSelected
                  ]}
                  onPress={() => {
                    setCategoryId(item.id);
                    setCategoryModalVisible(false);
                  }}>
                  <View style={[styles.categoryDot, {backgroundColor: item.color}]} />
                  <Typography
                    variant="body"
                    weight={categoryId === item.id ? 'bold' : 'normal'}>
                    {item.name}
                  </Typography>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={isDatePickerVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDatePickerVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="h3">Select Date</Typography>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                <Typography color="primary">Done</Typography>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TransactionFormScreen;
