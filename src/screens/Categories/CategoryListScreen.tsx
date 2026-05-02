import React, {useState, useCallback, useEffect} from 'react';
import {View, FlatList, TouchableOpacity, Alert, DeviceEventEmitter} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {Category} from '../../types';
import {categoryRepository} from '../../repositories/categoryRepository';
import {Typography} from '../../components/Typography';
import {Screen} from '../../components/Screen';
import {styles} from './styles/CategoryListScreen.styles';
import {CategoryStackParamList} from '../../navigation/types';
import {CategoryListItem} from './components/CategoryListItem';
import {PlusButton} from '../../components/PlusButton'
import {EmptyState} from '../../components/EmptyState';

type NavigationProp = NativeStackNavigationProp<CategoryStackParamList, 'CategoryList'>;

const CategoryListScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const loadCategories = useCallback(async () => {
    const data = await categoryRepository.getAll(false);
    setCategories(data);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    DeviceEventEmitter.emit('AppRefresh');
    await loadCategories();
    setIsLoading(false);
  }, [loadCategories]);

  useEffect(() => {
    const params = route.params as any;
    if (params?.handleRefresh !== handleRefresh || params?.isLoading !== isLoading) {
      navigation.setParams({handleRefresh, isLoading} as any);
    }
  }, [navigation, handleRefresh, isLoading, route.params]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('AppRefresh', loadCategories);
    return () => sub.remove();
  }, [loadCategories]);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  const handleEdit = (category: Category) => {
    navigation.navigate('CategoryForm', {categoryId: category.id});
  };

  const handleDelete = async (category: Category) => {
    const hasTxns = await categoryRepository.hasTransactions(category.id);

    if (hasTxns) {
      Alert.alert(
        'Archive Category',
        `"${category.name}" has transactions. It will be archived instead of deleted.`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Archive',
            style: 'destructive',
            onPress: async () => {
              await categoryRepository.archive(category.id);
              loadCategories();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Delete Category',
        `Are you sure you want to delete "${category.name}"?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await categoryRepository.hardDelete(category.id);
              loadCategories();
            },
          },
        ]
      );
    }
  };

  return (
    <Screen edges={[]}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => (
          <CategoryListItem item={item} onPress={handleEdit} onDelete={handleDelete} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState message="No categories found. Tap the + button to create one." />
        }
      />
      <PlusButton onPress={() => navigation.navigate('CategoryForm', {})} />
    </Screen>
  );
};

export default CategoryListScreen;
