import React from 'react';
import {View, StyleSheet} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Transaction} from '../../../types';
import {Typography} from '../../../components/Typography';
import {formatCurrency} from '../../../utils/formatCurrency';
import {theme} from '../../../theme';
import {ListItem} from '../../../components/ListItem';
import {ColorDot} from '../../../components/ColorDot';

interface TransactionItemProps {
  item: Transaction;
  onPress: (id: number) => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface ParentPillProps {
  name: string;
  color: string;
}

const ParentPill: React.FC<ParentPillProps> = ({name, color}) => (
  <View style={styles.pill}>
    <View style={[styles.pillDot, {backgroundColor: color}]} />
    <Typography variant="xs" color="textMuted" style={styles.pillText}>
      {name}
    </Typography>
  </View>
);

interface RightColumnProps {
  item: Transaction;
}

const RightColumn: React.FC<RightColumnProps> = ({item}) => (
  <View style={styles.rightColumn}>
    {item.category_parent_name && (
      <ParentPill
        name={item.category_parent_name}
        color={item.category_color || theme.colors.textMuted}
      />
    )}
    <Typography
      variant="body"
      weight="bold"
      color={item.type === 'income' ? 'success' : 'text'}
      style={styles.amount}>
      {item.type === 'income' ? '+' : '-'}
      {formatCurrency(item.amount)}
    </Typography>
  </View>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const TransactionItem: React.FC<TransactionItemProps> = ({item, onPress}) => {
  const color = item.category_color || theme.colors.textMuted;

  const leftElement = item.category_icon ? (
    <MaterialIcon name={item.category_icon} size={20} color={color} />
  ) : (
    <ColorDot color={color} />
  );

  // Primary label is always the child (or standalone root) name
  const title = item.category_name || 'Uncategorized';

  return (
    <ListItem
      onPress={() => onPress(item.id)}
      title={title}
      subtitle={item.note ?? undefined}
      leftElement={leftElement}
      rightElement={<RightColumn item={item} />}
    />
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  rightColumn: {
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    gap: 4,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    lineHeight: 14,
  },
  amount: {
    textAlign: 'right',
  },
});