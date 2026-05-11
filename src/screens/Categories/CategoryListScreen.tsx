import React, {useState, useCallback, useEffect} from 'react';
import {View, FlatList, Alert, DeviceEventEmitter} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {ParentCategory, Category} from '../../types';
import {categoryRepository} from '../../repositories/categoryRepository';
import {Typography} from '../../components/Typography';
import {Screen} from '../../components/Screen';
import {styles} from './styles/CategoryListScreen.styles';
import {CategoryStackParamList} from '../../navigation/types';
import {PlusButton} from '../../components/PlusButton';
import {EmptyState} from '../../components/EmptyState';
import {ParentCategoryRow} from './components/ParentCategoryRow';
import {ChildCategoryRow} from './components/ChildCategoryRow';

type NavigationProp = NativeStackNavigationProp<CategoryStackParamList, 'CategoryList'>;

const CategoryListScreen: React.FC = () => {
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------

  const loadCategories = useCallback(async () => {
    const data = await categoryRepository.getAllNested();
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
    }, [loadCategories]),
  );

  // ---------------------------------------------------------------------------
  // Accordion
  // ---------------------------------------------------------------------------

  const toggleExpanded = useCallback((id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const handleEdit = useCallback(
    (category: Category) => {
      navigation.navigate('CategoryForm', {categoryId: category.id});
    },
    [navigation],
  );

  // ---------------------------------------------------------------------------
  // Delete / archive — parent
  // ---------------------------------------------------------------------------

  const handleDeleteParent = useCallback(
    async (category: ParentCategory) => {
      const hasChildren = category.children.length > 0;
      const hasTxns = await categoryRepository.hasTransactions(category.id);

      if (hasChildren || hasTxns) {
        const message = hasChildren
          ? `Archiving "${category.name}" will also archive all its subcategories.`
          : `"${category.name}" has transactions. It will be archived instead of deleted.`;

        Alert.alert('Archive Category', message, [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Archive',
            style: 'destructive',
            onPress: async () => {
              await categoryRepository.archive(category.id);
              loadCategories();
            },
          },
        ]);
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
          ],
        );
      }
    },
    [loadCategories],
  );

  // ---------------------------------------------------------------------------
  // Delete / archive — child
  // ---------------------------------------------------------------------------

  const handleDeleteChild = useCallback(
    async (category: Category) => {
      const hasTxns = await categoryRepository.hasTransactions(category.id);

      if (hasTxns) {
        Alert.alert(
          'Archive Subcategory',
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
          ],
        );
      } else {
        Alert.alert(
          'Delete Subcategory',
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
          ],
        );
      }
    },
    [loadCategories],
  );

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  /**
   * Each FlatList item is either a parent row or one of its child/Others rows.
   * We flatten the nested structure into a single array of typed items so
   * FlatList can virtualise the full list without nested scrolling.
   */
  type ListRow =
    | {kind: 'parent'; data: ParentCategory}
    | {kind: 'child'; data: Category}
    | {kind: 'others'; parentColor: string};

  const rows: ListRow[] = [];
  for (const parent of categories) {
    rows.push({kind: 'parent', data: parent});
    if (expandedIds.has(parent.id)) {
      for (const child of parent.children) {
        rows.push({kind: 'child', data: child});
      }
      if (parent.children.length > 0) {
        rows.push({kind: 'others', parentColor: parent.color});
      }
    }
  }

  const renderRow = useCallback(
    ({item}: {item: ListRow}) => {
      if (item.kind === 'parent') {
        return (
          <ParentCategoryRow
            category={item.data}
            isExpanded={expandedIds.has(item.data.id)}
            onToggle={() => toggleExpanded(item.data.id)}
            onEdit={() => handleEdit(item.data)}
            onDelete={() => handleDeleteParent(item.data)}
          />
        );
      }

      if (item.kind === 'child') {
        return (
          <ChildCategoryRow
            category={item.data}
            onEdit={() => handleEdit(item.data)}
            onDelete={() => handleDeleteChild(item.data)}
          />
        );
      }

      // Others virtual row
      return <OthersRow color={item.parentColor} />;
    },
    [
      expandedIds,
      toggleExpanded,
      handleEdit,
      handleDeleteParent,
      handleDeleteChild,
    ],
  );

  return (
    <Screen edges={[]}>
      <FlatList
        data={rows}
        keyExtractor={(_item, index) => String(index)}
        renderItem={renderRow}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState message="No categories yet. Tap + to create one." />
        }
      />
      <PlusButton onPress={() => navigation.navigate('CategoryForm', {})} />
    </Screen>
  );
};

// ---------------------------------------------------------------------------
// Others virtual row — no edit/archive controls
// ---------------------------------------------------------------------------

interface OthersRowProps {
  color: string;
}

const OthersRow: React.FC<OthersRowProps> = ({color}) => (
  <View style={styles.othersRow}>
    <View style={styles.childIndent} />
    <View style={[styles.colorDot, {backgroundColor: color, opacity: 0.4}]} />
    <View style={styles.othersLabel}>
      <Typography variant="body" color="textMuted">
        Others
      </Typography>
    </View>
  </View>
);

export default CategoryListScreen;