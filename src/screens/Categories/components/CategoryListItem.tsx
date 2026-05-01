import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Category} from '../../../types';
import {Typography} from '../../../components/Typography';
import {ListItem} from '../../../components/ListItem';
import {ColorDot} from '../../../components/ColorDot';

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
      leftElement={<ColorDot color={item.color} size="lg" />}
      onPress={() => onPress(item)}
      rightElement={
        <TouchableOpacity
          onPress={() => onDelete(item)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Typography color="error" variant="caption" weight="semibold">
            DELETE
          </Typography>
        </TouchableOpacity>
      }
    />
  );
};
