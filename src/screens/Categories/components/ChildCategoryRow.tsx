import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Category} from '../../../types';
import {ListItem} from '../../../components/ListItem';
import {ColorDot} from '../../../components/ColorDot';
import {theme} from '../../../theme';

interface Props {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}

export const ChildCategoryRow: React.FC<Props> = ({category, onEdit, onDelete}) => {
  const leftElement = (
    <View style={styles.leftElement}>
      {/* Indentation connector line */}
      <View style={styles.indent} />
      {category.icon ? (
        <MaterialIcon name={category.icon} size={18} color={category.color} />
      ) : (
        <ColorDot color={category.color} size="sm" />
      )}
    </View>
  );

  const rightElement = (
    <View style={styles.rightElement}>
      <TouchableOpacity
        onPress={onEdit}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${category.name}`}>
        <MaterialIcon name="pencil-outline" size={20} color={theme.colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onDelete}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${category.name}`}>
        <MaterialIcon name="trash-can-outline" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ListItem
      title={category.name}
      leftElement={leftElement}
      rightElement={rightElement}
      style={styles.childItem}
    />
  );
};

const styles = StyleSheet.create({
  childItem: {
    marginLeft: theme.spacing.lg,
  },
  leftElement: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 32,
  },
  indent: {
    width: 2,
    height: 16,
    backgroundColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    borderRadius: 1,
  },
  rightElement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
});