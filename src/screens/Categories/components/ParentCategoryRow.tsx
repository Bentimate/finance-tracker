import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {ParentCategory} from '../../../types';
import {ListItem} from '../../../components/ListItem';
import {ColorDot} from '../../../components/ColorDot';
import {Typography} from '../../../components/Typography'; // retained for child count badge
import {theme} from '../../../theme';

interface Props {
  category: ParentCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ParentCategoryRow: React.FC<Props> = ({
  category,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const hasChildren = category.children.length > 0;

  const leftElement = (
    <View style={styles.leftElement}>
      {category.icon ? (
        <MaterialIcon name={category.icon} size={20} color={category.color} />
      ) : (
        <ColorDot color={category.color} />
      )}
    </View>
  );

  const rightElement = (
    <View style={styles.rightElement}>
      {/* Child count badge */}
      {hasChildren && (
        <View style={styles.badge}>
          <Typography variant="caption" color="textMuted">
            {category.children.length}
          </Typography>
        </View>
      )}

      {/* Edit */}
      <TouchableOpacity
        onPress={onEdit}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${category.name}`}>
        <MaterialIcon name="pencil-outline" size={20} color={theme.colors.primary} />
      </TouchableOpacity>

      {/* Delete / archive */}
      <TouchableOpacity
        onPress={onDelete}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${category.name}`}>
        <MaterialIcon name="trash-can-outline" size={20} color={theme.colors.error} />
      </TouchableOpacity>

      {/* Expand chevron — only shown when parent has children */}
      {hasChildren && (
        <MaterialIcon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.textMuted}
        />
      )}
    </View>
  );

  return (
    <ListItem
      title={category.name}
      leftElement={leftElement}
      rightElement={rightElement}
      onPress={hasChildren ? onToggle : undefined}
    />
  );
};

const styles = StyleSheet.create({
  leftElement: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightElement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  badge: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
});