import React from 'react';
import {TouchableOpacity} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Category} from '../../../types';
import {ListItem} from '../../../components/ListItem';
import {ColorDot} from '../../../components/ColorDot';
import {theme} from '../../../theme';

interface CategoryListItemProps {
  item: Category;
  onPress: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export const CategoryListItem: React.FC<CategoryListItemProps> = ({
  item,
  onPress,
  onDelete,
}) => {
  return (
    <ListItem
      title={item.name}
      leftElement={<ColorDot color={item.color} />}
      onPress={() => onPress(item)}
      rightElement={
        <TouchableOpacity
          onPress={() => onDelete(item)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.name}`}>
          <MaterialIcon
            name="trash-can-outline"
            size={20}
            color={theme.colors.error}
          />
        </TouchableOpacity>
      }
    />
  );
};