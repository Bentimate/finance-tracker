import {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, DeviceEventEmitter} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Category} from '../../../types';
import {categoryRepository} from '../../../repositories/categoryRepository';
import {CategoryStackParamList} from '../../../navigation/types';
import {PRESET_COLORS} from '../components/ColorPicker';
import {categoryRulesService} from '../services/CategoryRulesService';

type NavigationProp = NativeStackNavigationProp<CategoryStackParamList, 'CategoryForm'>;
type FormRouteProp = RouteProp<CategoryStackParamList, 'CategoryForm'>;

export interface CategoryFormViewModel {
  isEdit: boolean;
  categoryId?: number;
  name: string;
  color: string;
  icon: string | null;
  parentId: number | null;
  loading: boolean;
  nameError: string;
  isIconPickerVisible: boolean;
  isParentPickerVisible: boolean;
  rootCategories: Category[];
  hasChildren: boolean;
  selectedParent: Category | null;
  selectableParents: Category[];
  setName: (value: string) => void;
  setColor: (value: string) => void;
  setIcon: (value: string | null) => void;
  setParentId: (value: number | null) => void;
  setIconPickerVisible: (value: boolean) => void;
  setParentPickerVisible: (value: boolean) => void;
  handleSave: () => Promise<void>;
  handleArchive: () => Promise<void>;
}

export function useCategoryFormViewModel(): CategoryFormViewModel {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FormRouteProp>();
  const categoryId = route.params?.categoryId;
  const isEdit = !!categoryId;

  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState<string | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [isIconPickerVisible, setIconPickerVisible] = useState(false);
  const [isParentPickerVisible, setParentPickerVisible] = useState(false);
  const [rootCategories, setRootCategories] = useState<Category[]>([]);
  const [hasChildren, setHasChildren] = useState(false);

  useEffect(() => {
    void categoryRepository.getAll(false).then(all => {
      setRootCategories(all.filter(item => item.parent_id === null));
    });
  }, []);

  useEffect(() => {
    if (!categoryId) {
      return;
    }

    void categoryRepository.getById(categoryId).then(category => {
      if (!category) {
        return;
      }
      setName(category.name);
      setColor(category.color);
      setIcon(category.icon);
      setParentId(category.parent_id);
    });

    void categoryRepository.hasChildren(categoryId).then(setHasChildren);
  }, [categoryId]);

  const persistSave = useCallback(async () => {
    setLoading(true);
    try {
      if (isEdit && categoryId) {
        await categoryRepository.update(categoryId, {name, color, icon, parentId});
      } else {
        await categoryRepository.create({name, color, icon, parentId});
      }
      DeviceEventEmitter.emit('AppRefresh');
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save category';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [isEdit, categoryId, name, color, icon, parentId, navigation]);

  const handleSave = useCallback(async () => {
    const nameValidation = categoryRulesService.validateName(name);
    if (!nameValidation.ok) {
      setNameError(nameValidation.message || 'Name is required');
      return;
    }

    if (!isEdit && parentId !== null) {
      const isFirst = await categoryRepository.isFirstChild(parentId);
      if (categoryRulesService.shouldShowFirstChildWarning({isEdit, parentId, isFirstChild: isFirst})) {
        const parentName = rootCategories.find(item => item.id === parentId)?.name ?? 'this category';
        Alert.alert('Heads up', categoryRulesService.buildFirstChildWarningMessage(parentName), [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Continue', onPress: () => void persistSave()},
        ]);
        return;
      }
    }

    await persistSave();
  }, [name, isEdit, parentId, rootCategories, persistSave]);

  const handleArchive = useCallback(async () => {
    if (!categoryId) {
      return;
    }

    const confirmMessage = hasChildren
      ? 'Archiving this category will also archive all its subcategories. Continue?'
      : 'This category will be archived and hidden from active lists.';

    Alert.alert('Archive Category', confirmMessage, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          await categoryRepository.archive(categoryId);
          DeviceEventEmitter.emit('AppRefresh');
          navigation.goBack();
        },
      },
    ]);
  }, [categoryId, hasChildren, navigation]);

  const selectedParent = useMemo(
    () => rootCategories.find(item => item.id === parentId) ?? null,
    [rootCategories, parentId],
  );

  const selectableParents = useMemo(
    () => rootCategories.filter(item => item.id !== categoryId),
    [rootCategories, categoryId],
  );

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      if (nameError) {
        setNameError('');
      }
    },
    [nameError],
  );

  return {
    isEdit,
    categoryId,
    name,
    color,
    icon,
    parentId,
    loading,
    nameError,
    isIconPickerVisible,
    isParentPickerVisible,
    rootCategories,
    hasChildren,
    selectedParent,
    selectableParents,
    setName: handleNameChange,
    setColor,
    setIcon,
    setParentId,
    setIconPickerVisible,
    setParentPickerVisible,
    handleSave,
    handleArchive,
  };
}
