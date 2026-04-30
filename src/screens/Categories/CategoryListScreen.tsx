import React, {useState, useCallback, useEffect} from 'react';
import {View, FlatList, TouchableOpacity, Alert, DeviceEventEmitter} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {Category} from '../../types';
import {getAllCategories, archiveCategory, categoryHasTransactions, hardDeleteCategory} from '../../repositories/categoryRepository';
import {Typography} from '../../components/Typography';
import {ListItem} from '../../components/ListItem';
import {ColorDot} from '../../components/ColorDot';
import {styles} from './styles/CategoryListScreen.styles';
import {CategoryStackParamList} from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<CategoryStackParamList, 'CategoryList'>;

const CategoryListScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const loadCategories = useCallback(async () => {
    console.log('Fetching categories...');
    const data = await getAllCategories(false); // Only active categories
    console.log('Categories fetched:', JSON.stringify(data));
    setCategories(data);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    DeviceEventEmitter.emit('AppRefresh');
    await loadCategories();
    setIsLoading(false);
  }, [loadCategories]);

  // Pass refresh handler to navigation params
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
    const hasTxns = await categoryHasTransactions(category.id);

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
              await archiveCategory(category.id);
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
              await hardDeleteCategory(category.id);
              loadCategories();
            },
          },
        ]
      );
    }
  };

  const renderItem = ({item}: {item: Category}) => (
    <ListItem
      title={item.name}
      leftElement={<ColorDot color={item.color} size="lg" />}
      onPress={() => handleEdit(item)}
      rightElement={
        <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Typography color="error" variant="caption" weight="semibold">DELETE</Typography>
        </TouchableOpacity>
      }
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Typography variant="body" color="textMuted" align="center">
              No categories found. Tap the + button to create one.
            </Typography>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CategoryForm', {})}
        activeOpacity={0.8}>
        <Typography style={styles.fabText}>+</Typography>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CategoryListScreen;
