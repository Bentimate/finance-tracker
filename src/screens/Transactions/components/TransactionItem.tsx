import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Transaction} from '../../../types';
import {Typography} from '../../../components/Typography';
import {formatCurrency} from '../../../utils/formatCurrency';
import {theme} from '../../../theme';
import {styles} from '../styles/TransactionListScreen.styles';

interface TransactionItemProps {
  item: Transaction;
  onPress: (id: number) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({item, onPress}) => {
  return (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => onPress(item.id)}
      activeOpacity={0.6}>
      <View
        style={[
          styles.categoryDot,
          {backgroundColor: item.category_color || theme.colors.textMuted},
        ]}
      />
      <View style={styles.txInfo}>
        <Typography variant="body" weight="medium">
          {item.category_name || 'Uncategorized'}
        </Typography>
        {item.note ? (
          <Typography variant="caption" color="textSecondary" numberOfLines={1}>
            {item.note}
          </Typography>
        ) : null}
      </View>
      <View style={styles.txAmount}>
        <Typography
          variant="body"
          weight="bold"
          color={item.type === 'income' ? 'success' : 'text'}>
          {item.type === 'income' ? '+' : '-'}
          {formatCurrency(item.amount)}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};
