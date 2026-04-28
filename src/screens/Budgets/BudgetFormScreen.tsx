import React, {useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {theme} from '../../theme';
import {Typography} from '../../components/Typography';
import {Button} from '../../components/Button';
import {Input} from '../../components/Input';
import {BudgetStackParamList} from '../../navigation/types';
import {Category} from '../../types';
import {getAllCategories} from '../../repositories/categoryRepository';
import {
  upsertBudget,
  getBudgetByCategory,
  deleteBudget,
} from '../../repositories/budgetRepository';
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
      const cats = await getAllCategories();
      setCategories(cats);

      if (initialCategoryId && initialCategoryId > 0) {
        const budget = await getBudgetByCategory(initialCategoryId);
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
      await upsertBudget({
        category_id: categoryId,
        budget_amount: numAmount,
        period,
      });
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
              await deleteBudget(categoryId);
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

export default BudgetFormScreen;
