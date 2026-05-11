import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {DeviceEventEmitter} from 'react-native';

import {Category} from '../../types';
import {categoryRepository} from '../../repositories/categoryRepository';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {Screen} from '../../components/Screen';
import {Typography} from '../../components/Typography';
import {CategoryStackParamList} from '../../navigation/types';
import {ColorPicker, PRESET_COLORS} from './components/ColorPicker';
import IconPickerModal from '../../components/IconPickerModal';
import {theme} from '../../theme';
import {styles} from './styles/CategoryFormScreen.styles';

type NavigationProp = NativeStackNavigationProp<CategoryStackParamList, 'CategoryForm'>;
type FormRouteProp = RouteProp<CategoryStackParamList, 'CategoryForm'>;

const CategoryFormScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FormRouteProp>();
  const categoryId = route.params?.categoryId;
  const isEdit = !!categoryId;

  // Form fields
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState<string | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [isIconPickerVisible, setIconPickerVisible] = useState(false);
  const [isParentPickerVisible, setParentPickerVisible] = useState(false);

  // Data
  const [rootCategories, setRootCategories] = useState<Category[]>([]);
  const [hasChildren, setHasChildren] = useState(false);

  // ---------------------------------------------------------------------------
  // Load root categories for the parent selector, and populate form on edit
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Fetch all non-archived root categories to populate the parent dropdown.
    // We filter to parent_id === null in JS rather than adding a new repo method.
    categoryRepository.getAll(false).then(all => {
      const roots = all.filter(c => c.parent_id === null);
      setRootCategories(roots);
    });
  }, []);

  useEffect(() => {
    if (!categoryId) return;

    categoryRepository.getById(categoryId).then(category => {
      if (!category) return;
      setName(category.name);
      setColor(category.color);
      setIcon(category.icon);
      setParentId(category.parent_id);
    });

    // Check if this category already has children — used to disable reparenting
    categoryRepository.hasChildren(categoryId).then(setHasChildren);
  }, [categoryId]);

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------

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
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  }, [isEdit, categoryId, name, color, icon, parentId, navigation]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

    // First-child warning: if assigning a parent for the first time and that
    // parent currently has no children, warn the user that existing transactions
    // on the parent will appear under "Others".
    if (!isEdit && parentId !== null) {
      const isFirst = await categoryRepository.isFirstChild(parentId);
      if (isFirst) {
        const parentName =
          rootCategories.find(c => c.id === parentId)?.name ?? 'this category';
        Alert.alert(
          'Heads up',
          `Existing transactions assigned directly to "${parentName}" will appear under "Others" in charts. You can reassign them later.`,
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Continue', onPress: persistSave},
          ],
        );
        return;
      }
    }

    await persistSave();
  }, [name, isEdit, parentId, rootCategories, persistSave]);

  // ---------------------------------------------------------------------------
  // Archive (edit mode only)
  // ---------------------------------------------------------------------------

  const handleArchive = useCallback(async () => {
    if (!categoryId) return;

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

  // ---------------------------------------------------------------------------
  // Derived display values
  // ---------------------------------------------------------------------------

  const selectedParent = rootCategories.find(c => c.id === parentId) ?? null;

  // Exclude the category being edited from the parent list (can't be its own parent),
  // and exclude categories that are already children (depth guard).
  const selectableParents = rootCategories.filter(c => c.id !== categoryId);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Screen
      withKeyboardAvoidingView
      scrollable
      contentStyle={styles.content}
      edges={[]}
      footer={
        <View style={styles.footerRow}>
          {isEdit && (
            <Button
              title="Archive"
              variant="outline"
              onPress={handleArchive}
              style={[styles.footerButtonBase, styles.archiveButton]}
              textStyle={{color: theme.colors.error}}
            />
          )}
          <Button
            title={isEdit ? 'Update Category' : 'Create Category'}
            onPress={handleSave}
            loading={loading}
            style={styles.footerButtonPrimary}
          />
        </View>
      }>

      {/* Name */}
      <Input
        label="Category Name"
        value={name}
        onChangeText={text => {
          setName(text);
          if (nameError) setNameError('');
        }}
        placeholder="e.g. Groceries"
        error={nameError}
        autoFocus={!isEdit}
      />

      {/* Color */}
      <ColorPicker selectedColor={color} onColorSelect={setColor} />

      {/* Icon */}
      <View style={styles.field}>
        <Typography variant="label" color="textSecondary" style={styles.fieldLabel}>
          ICON (OPTIONAL)
        </Typography>
        <TouchableOpacity
          style={styles.selectorRow}
          onPress={() => setIconPickerVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Choose icon">
          {icon ? (
            <View style={styles.selectorRowInner}>
              <MaterialIcon name={icon} size={24} color={color} />
              <Typography variant="body">{icon}</Typography>
            </View>
          ) : (
            <Typography variant="body" color="textMuted">
              Tap to choose an icon…
            </Typography>
          )}
          <MaterialIcon name="chevron-right" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Parent category */}
      <View style={styles.field}>
        <Typography variant="label" color="textSecondary" style={styles.fieldLabel}>
          PARENT CATEGORY (OPTIONAL)
        </Typography>

        {/* Reparenting is disabled when the category already has children */}
        {isEdit && hasChildren ? (
          <View style={[styles.selectorRow, styles.selectorRowDisabled]}>
            <Typography variant="body" color="textMuted">
              {selectedParent ? selectedParent.name : 'None (top-level)'}
            </Typography>
            <Typography variant="caption" color="textMuted">
              Has subcategories
            </Typography>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.selectorRow}
            onPress={() => setParentPickerVisible(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Choose parent category">
            {selectedParent ? (
              <View style={styles.selectorRowInner}>
                <View style={[styles.colorDot, {backgroundColor: selectedParent.color}]} />
                <Typography variant="body">{selectedParent.name}</Typography>
              </View>
            ) : (
              <Typography variant="body" color="textMuted">
                None (top-level category)
              </Typography>
            )}
            <MaterialIcon name="chevron-right" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Icon picker modal */}
      <IconPickerModal
        visible={isIconPickerVisible}
        selectedIcon={icon}
        onSelect={setIcon}
        onClose={() => setIconPickerVisible(false)}
      />

      {/* Parent picker modal — inline bottom sheet style */}
      {isParentPickerVisible && (
        <ParentPickerModal
          categories={selectableParents}
          selectedId={parentId}
          onSelect={id => {
            setParentId(id);
            setParentPickerVisible(false);
          }}
          onClose={() => setParentPickerVisible(false)}
        />
      )}
    </Screen>
  );
};

// ---------------------------------------------------------------------------
// ParentPickerModal — lightweight inline modal for parent selection
// ---------------------------------------------------------------------------

interface ParentPickerProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onClose: () => void;
}

const ParentPickerModal: React.FC<ParentPickerProps> = ({
  categories,
  selectedId,
  onSelect,
  onClose,
}) => {
  return (
    <View style={styles.pickerOverlay}>
      <TouchableOpacity style={styles.pickerBackdrop} onPress={onClose} activeOpacity={1} />
      <View style={styles.pickerSheet}>
        <View style={styles.pickerHeader}>
          <Typography variant="h3">Parent Category</Typography>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <MaterialIcon name="close" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.pickerRow}
            onPress={() => onSelect(null)}
            activeOpacity={0.7}>
            <Typography
              variant="body"
              color={selectedId === null ? 'primary' : 'text'}>
              None (top-level category)
            </Typography>
            {selectedId === null && (
              <MaterialIcon name="check" size={18} color={theme.colors.primary} />
            )}
          </TouchableOpacity>

          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={styles.pickerRow}
              onPress={() => onSelect(cat.id)}
              activeOpacity={0.7}>
              <View style={styles.pickerRowLeft}>
                <View style={[styles.pickerDot, {backgroundColor: cat.color}]} />
                {cat.icon && (
                  <MaterialIcon
                    name={cat.icon}
                    size={18}
                    color={cat.color}
                    style={styles.pickerIconGap}
                  />
                )}
                <Typography
                  variant="body"
                  color={selectedId === cat.id ? 'primary' : 'text'}>
                  {cat.name}
                </Typography>
              </View>
              {selectedId === cat.id && (
                <MaterialIcon name="check" size={18} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default CategoryFormScreen;