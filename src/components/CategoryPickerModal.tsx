import React from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {Typography} from './Typography';
import {Category} from '../types';
import {styles} from './styles/CategoryPickerModal.styles';
import {BottomSheet} from './BottomSheet';
import {ListItem} from './ListItem';
import {ColorDot} from './ColorDot';

interface CategoryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number) => void;
}

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
  visible,
  onClose,
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.modalHeader}>
        <Typography variant="h3">Select Category</Typography>
        <TouchableOpacity onPress={onClose}>
          <Typography color="primary">Done</Typography>
        </TouchableOpacity>
      </View>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.categoryList}
        renderItem={({item}) => (
          <ListItem
            title={item.name}
            leftElement={<ColorDot color={item.color} />}
            selected={selectedCategoryId === item.id}
            onPress={() => onSelectCategory(item.id)}
          />
        )}
      />
    </BottomSheet>
  );
};
