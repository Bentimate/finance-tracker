import React, {useState, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

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

const TransactionFormScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FormRouteProp>();
  const {transactionId} = route.params;

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString());

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
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
            setType(tx.type);
            setAmount(tx.amount.toString());
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

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (!categoryId) {
      Alert.alert('Category Required', 'Please select a category.');
      return;
    }

    const data = {
      amount: numAmount,
      type,
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
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
            onPress={() => setType('expense')}>
            <Typography
              variant="label"
              color={type === 'expense' ? 'error' : 'textSecondary'}
              weight={type === 'expense' ? 'bold' : 'medium'}>
              EXPENSE
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
            onPress={() => setType('income')}>
            <Typography
              variant="label"
              color={type === 'income' ? 'success' : 'textSecondary'}
              weight={type === 'income' ? 'bold' : 'medium'}>
              INCOME
            </Typography>
          </TouchableOpacity>
        </View>

        <View style={styles.amountContainer}>
          <TextInput
            style={[
              styles.amountInput,
              {color: type === 'income' ? theme.colors.success : theme.colors.error}
            ]}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={theme.colors.textMuted}
            autoFocus={!transactionId}
          />
          <Typography variant="caption" color="textMuted" style={styles.amountLabel}>
            AMOUNT IN SGD
          </Typography>
        </View>

        <View style={styles.section}>
          <Typography variant="label" color="textSecondary" style={{marginBottom: 8}}>
            CATEGORY
          </Typography>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setCategoryModalVisible(true)}>
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

        <Input
          label="DATE"
          value={new Date(date).toLocaleDateString()}
          editable={false}
          onPressIn={() => {/* TODO: Date Picker */}}
        />
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
                    weight={categoryId === item.id ? 'bold' : 'regular'}>
                    {item.name}
                  </Typography>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TransactionFormScreen;
