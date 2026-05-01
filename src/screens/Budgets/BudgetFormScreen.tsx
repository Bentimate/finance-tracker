import React, {useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {theme} from '../../theme';
import {Typography} from '../../components/Typography';
import {Button} from '../../components/Button';
import {Input} from '../../components/Input';
import {CategoryPickerModal} from '../../components/CategoryPickerModal';
import {BudgetStackParamList} from '../../navigation/types';
import {Category} from '../../types';
import {categoryRepository} from '../../repositories/categoryRepository';
import {budgetRepository} from '../../repositories/budgetRepository';
import {styles} from './styles/BudgetFormScreen.styles';

type NavigationProp = NativeStackNavigationProp<BudgetStackParamList, 'BudgetForm'>;
type FormRouteProp = RouteProp<BudgetStackParamList, 'BudgetForm'>;

const BudgetFormScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FormRouteProp>();
  const initialCategoryId = route.params?.categoryId;

  const [categoryId, setCategoryId] = useState<number | null>(
    initialCategoryId && initialCategoryId > 0 ? initialCategoryId : null
  );
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const cats = await categoryRepository.getAll();
      setCategories(cats);

      if (initialCategoryId && initialCategoryId > 0) {
        const budget = await budgetRepository.getByCategory(initialCategoryId);
        if (budget) {
          setAmount(budget.budget_amount.toString());
          setPeriod(budget.period);
          setIsEdit(true);
        }
      }
    };

    fetchData();
  }, [initialCategoryId]);

  const selectedCategory = categories.find(c => c.id === categoryId);

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount.');
      return;
    }

    if (!categoryId) {
      Alert.alert('Category Required', 'Please select a category for this budget.');
      return;
    }

    try {
      await budgetRepository.upsert({
        category_id: categoryId,
        budget_amount: numAmount,
        period,
      });
      DeviceEventEmitter.emit('AppRefresh');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save budget.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove Budget',
      'Are you sure you want to remove the budget for this category?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (categoryId) {
              await budgetRepository.delete(categoryId);
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
        <View style={styles.section}>
          <Typography variant="label" color="textSecondary" style={{marginBottom: 8}}>
            CATEGORY
          </Typography>
          <TouchableOpacity
            style={[styles.categorySelector, isEdit && {opacity: 0.6}]}
            onPress={() => !isEdit && setCategoryModalVisible(true)}
            disabled={isEdit}>
            {selectedCategory ? (
              <>
                <View style={[styles.categoryDot, {backgroundColor: selectedCategory.color}]} />
                <Typography variant="body">{selectedCategory.name}</Typography>
              </>
            ) : (
              <Typography variant="body" color="textMuted">Select Category</Typography>
            )}
          </TouchableOpacity>
          {isEdit && (
            <Typography variant="caption" color="textMuted" style={{marginTop: 4}}>
              Category cannot be changed for an existing budget.
            </Typography>
          )}
        </View>

        <Input
          label="BUDGET AMOUNT (SGD)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          autoFocus={!isEdit}
        />

        <View style={styles.section}>
          <Typography variant="label" color="textSecondary" style={{marginBottom: 8}}>
            PERIOD
          </Typography>
          <View style={styles.periodContainer}>
            <TouchableOpacity
              style={[styles.periodButton, period === 'weekly' && styles.periodButtonActive]}
              onPress={() => setPeriod('weekly')}>
              <Typography
                variant="label"
                color={period === 'weekly' ? 'primary' : 'textSecondary'}
                weight={period === 'weekly' ? 'bold' : 'medium'}>
                WEEKLY
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, period === 'monthly' && styles.periodButtonActive]}
              onPress={() => setPeriod('monthly')}>
              <Typography
                variant="label"
                color={period === 'monthly' ? 'primary' : 'textSecondary'}
                weight={period === 'monthly' ? 'bold' : 'medium'}>
                MONTHLY
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isEdit && (
          <Button
            title="Remove"
            variant="outline"
            onPress={handleDelete}
            style={{flex: 1, borderColor: theme.colors.error}}
            textStyle={{color: theme.colors.error}}
          />
        )}
        <Button
          title={isEdit ? 'Update Budget' : 'Set Budget'}
          onPress={handleSave}
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
    </SafeAreaView>
  );
};

export default BudgetFormScreen;
