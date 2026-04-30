import React, {useState, useCallback, useEffect} from 'react';
import {View, FlatList, TouchableOpacity, DeviceEventEmitter} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {BudgetProgress} from '../../types';
import {getAllBudgetProgress} from '../../repositories/budgetRepository';
import {Typography} from '../../components/Typography';
import {formatCurrency} from '../../utils/formatCurrency';
import {theme} from '../../theme';
import {styles} from './styles/BudgetListScreen.styles';
import {BudgetStackParamList} from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<BudgetStackParamList, 'BudgetList'>;

const BudgetListScreen: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const loadBudgets = useCallback(async () => {
    const data = await getAllBudgetProgress();
    setBudgets(data);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    DeviceEventEmitter.emit('AppRefresh');
    await loadBudgets();
    setIsLoading(false);
  }, [loadBudgets]);

  // Pass refresh handler to navigation params
  useEffect(() => {
    const params = route.params as any;
    if (params?.handleRefresh !== handleRefresh || params?.isLoading !== isLoading) {
      navigation.setParams({handleRefresh, isLoading} as any);
    }
  }, [navigation, handleRefresh, isLoading, route.params]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('AppRefresh', loadBudgets);
    return () => sub.remove();
  }, [loadBudgets]);

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [loadBudgets])
  );

  const renderItem = ({item}: {item: BudgetProgress}) => {
    const isOver = item.percentage > 100;
    const progressColor = isOver
      ? theme.colors.error
      : item.percentage > 80
        ? '#f59e0b' // Warning yellow
        : theme.colors.primary;

    return (
      <TouchableOpacity
        style={styles.budgetItem}
        onPress={() => navigation.navigate('BudgetForm', {categoryId: item.category_id})}
        activeOpacity={0.7}
      >
        <View style={styles.budgetTop}>
          <View>
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryDot, {backgroundColor: item.category_color}]} />
              <Typography variant="body" weight="bold">{item.category_name}</Typography>
            </View>
            <Typography variant="caption" color="textMuted" style={{marginTop: 2}}>
              {item.period.toUpperCase()}
            </Typography>
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <Typography variant="body" weight="bold">
              {formatCurrency(item.spent)}
              <Typography variant="caption" color="textMuted"> / {formatCurrency(item.budget_amount)}</Typography>
            </Typography>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(item.percentage, 100)}%`,
                backgroundColor: progressColor
              }
            ]}
          />
        </View>

        <View style={styles.budgetFooter}>
          <Typography variant="caption" color="textMuted">
            {isOver
              ? `${formatCurrency(Math.abs(item.remaining))} over budget`
              : `${formatCurrency(item.remaining)} remaining`}
          </Typography>
          <Typography variant="caption" color={isOver ? 'error' : 'textMuted'}>
            {Math.round(item.percentage)}%
          </Typography>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.category_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Typography variant="body" color="textMuted" align="center">
              No budgets set up yet. Set a budget to track your spending by category.
            </Typography>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('BudgetForm', {categoryId: 0})}
        activeOpacity={0.8}>
        <Typography style={styles.fabText}>+</Typography>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default BudgetListScreen;
