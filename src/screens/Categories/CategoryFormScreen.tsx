import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  DeviceEventEmitter,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {categoryRepository} from '../../repositories/categoryRepository';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {Screen} from '../../components/Screen';
import {styles} from './styles/CategoryFormScreen.styles';
import {CategoryStackParamList} from '../../navigation/types';
import {ColorPicker, PRESET_COLORS} from './components/ColorPicker';

type NavigationProp = NativeStackNavigationProp<CategoryStackParamList, 'CategoryForm'>;
type FormRouteProp = RouteProp<CategoryStackParamList, 'CategoryForm'>;

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
      categoryRepository.getById(categoryId).then(category => {
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
        await categoryRepository.update(categoryId, {name, color});
      } else {
        await categoryRepository.create({name, color});
      }
      DeviceEventEmitter.emit('AppRefresh');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      withKeyboardAvoidingView
      scrollable
      contentStyle={styles.content}
      edges={[]}
      footer={
        <Button
          title={isEdit ? 'Update Category' : 'Create Category'}
          onPress={handleSave}
          loading={loading}
          style={{flex: 1}}
        />
      }>
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

      <ColorPicker selectedColor={color} onColorSelect={setColor} />
    </Screen>
  );
};

export default CategoryFormScreen;
