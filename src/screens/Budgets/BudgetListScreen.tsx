import React, {useState, useCallback, useEffect} from 'react';
import {View, FlatList, TouchableOpacity, DeviceEventEmitter} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {BudgetProgress} from '../../types';
import {budgetRepository} from '../../repositories/budgetRepository';
import {Typography} from '../../components/Typography';
import {styles} from './styles/BudgetListScreen.styles';
import {BudgetStackParamList} from '../../navigation/types';
import {BudgetItem} from './components/BudgetItem';
import {PlusButton} from '../../components/PlusButton'

type NavigationProp = NativeStackNavigationProp<BudgetStackParamList, 'BudgetList'>;

const BudgetListScreen: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const loadBudgets = useCallback(async () => {
    const data = await budgetRepository.getAllProgress();
    setBudgets(data);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    DeviceEventEmitter.emit('AppRefresh');
    await loadBudgets();
    setIsLoading(false);
  }, [loadBudgets]);

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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.category_id.toString()}
        renderItem={({item}) => (
          <BudgetItem
            item={item}
            onPress={(id) => navigation.navigate('BudgetForm', {categoryId: id})}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Typography variant="body" color="textMuted" align="center">
              No budgets set up yet. Set a budget to track your spending by category.
            </Typography>
          </View>
        }
      />
      <PlusButton onPress={() => navigation.navigate('BudgetForm', {categoryId: 0})} />
    </SafeAreaView>
  );
};

export default BudgetListScreen;
