import React from 'react';
import {View, TouchableOpacity} from 'react-native';
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
  return (
    <ListItem
      onPress={() => onPress(item.id)}
      title={item.category_name || 'Uncategorized'}
      subtitle={item.note}
      leftElement={<ColorDot color={item.category_color || theme.colors.textMuted} />}
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
