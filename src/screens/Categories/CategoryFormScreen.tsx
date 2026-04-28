import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  createCategory,
  updateCategory,
  getCategoryById,
} from '../../repositories/categoryRepository';
import {Typography} from '../../components/Typography';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {theme} from '../../theme';
import {styles} from './styles/CategoryFormScreen.styles';
import {CategoryStackParamList} from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<CategoryStackParamList, 'CategoryForm'>;
type FormRouteProp = RouteProp<CategoryStackParamList, 'CategoryForm'>;

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#64748b', // Slate
];

const CategoryFormScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FormRouteProp>();
  const categoryId = route.params?.categoryId;

  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!categoryId;

  useEffect(() => {
    if (categoryId) {
      getCategoryById(categoryId).then(category => {
        if (category) {
          setName(category.name);
          setColor(category.color);
        }
      });
    }
  }, [categoryId]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    try {
      if (isEdit && categoryId) {
        await updateCategory(categoryId, {name, color});
      } else {
        await createCategory({name, color});
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.content}>
          <Input
            label="Category Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (error) setError('');
            }}
            placeholder="e.g. Groceries"
            error={error}
            autoFocus={!isEdit}
          />

          <View style={styles.colorSection}>
            <Typography variant="label" color="textSecondary">
              Select Color
            </Typography>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorOption,
                    color === c && styles.colorOptionSelected,
                  ]}
                  onPress={() => setColor(c)}>
                  <View style={[styles.colorInner, {backgroundColor: c}]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={isEdit ? 'Update Category' : 'Create Category'}
            onPress={handleSave}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CategoryFormScreen;
