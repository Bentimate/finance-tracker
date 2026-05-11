import React from 'react';
import {View} from 'react-native';
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

export const TransactionItem: React.FC<TransactionItemProps> = ({item, onPress}) => {
  // Build display label: "Food > Coffee" for children, "Transport" for standalone
  const displayLabel = item.category_parent_name
    ? `${item.category_parent_name} > ${item.category_name}`
    : (item.category_name || 'Uncategorized');

  const color = item.category_color || theme.colors.textMuted;

  // Left element: icon if available, color dot otherwise
  const leftElement = item.category_icon ? (
    <MaterialIcon name={item.category_icon} size={20} color={color} />
  ) : (
    <ColorDot color={color} />
  );

  return (
    <ListItem
      onPress={() => onPress(item.id)}
      title={displayLabel}
      subtitle={item.note}
      leftElement={leftElement}
      rightElement={
        <Typography
          variant="body"
          weight="bold"
          color={item.type === 'income' ? 'success' : 'text'}>
          {item.type === 'income' ? '+' : '-'}
          {formatCurrency(item.amount)}
        </Typography>
      }
    />
  );
};