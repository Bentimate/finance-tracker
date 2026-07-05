import React, {useCallback, useEffect, useState} from 'react';
import {Dimensions, FlatList, TouchableOpacity, View} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {BottomSheet} from '../../../components/BottomSheet';
import {EmptyState} from '../../../components/EmptyState';
import {ListItem} from '../../../components/ListItem';
import {Typography} from '../../../components/Typography';
import {recurringTransactionRepository} from '../../../repositories/recurringTransactionRepository';
import {RecurringTransaction} from '../../../types';
import {theme} from '../../../theme';
import {styles} from '../styles/RecurringTransactionsSheet.styles';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: () => void;
  onEdit: (id: number) => void;
  accountId?: number;
}

const SCREEN_HEIGHT_RATIO = 0.5;

export const RecurringTransactionsSheet: React.FC<Props> = ({
  visible,
  onClose,
  onAdd,
  onEdit,
  accountId,
}) => {
  const [items, setItems] = useState<RecurringTransaction[]>([]);

  const loadItems = useCallback(async () => {
    const data = await recurringTransactionRepository.getAll(false, accountId);
    setItems(data);
  }, [accountId]);

  useEffect(() => {
    if (visible) {
      loadItems();
    }
  }, [visible, loadItems]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      maxHeight={Dimensions.get('window').height * SCREEN_HEIGHT_RATIO}>
      <View style={styles.header}>
        <Typography variant="h3">Recurring Transactions</Typography>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAdd}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add recurring transaction">
          <Typography style={styles.addButtonText}>+</Typography>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No recurring transactions yet." />}
        renderItem={({item}) => (
          <ListItem
            title={formatTemplateTitle(item)}
            subtitle={formatTemplateSubtitle(item)}
            style={styles.item}
            onPress={() => onEdit(item.id)}
            leftElement={
              item.category_icon ? (
                <MaterialIcon
                  name={item.category_icon}
                  size={18}
                  color={item.category_color ?? theme.colors.primary}
                />
              ) : (
                <View
                  style={[
                    styles.colorDot,
                    {backgroundColor: item.category_color ?? theme.colors.primary},
                  ]}
                />
              )
            }
            rightElement={
              <View style={styles.meta}>
                <Typography
                  variant="caption"
                  color={item.type === 'expense' ? 'error' : 'success'}
                  style={styles.amount}>
                  {formatAmount(item)}
                </Typography>
                <Typography variant="caption" color="textMuted">
                  {new Date(item.next_occurrence).toLocaleDateString()}
                </Typography>
              </View>
            }
          />
        )}
      />
    </BottomSheet>
  );
};

function formatTemplateTitle(item: RecurringTransaction): string {
  return item.category_parent_name
    ? `${item.category_parent_name} > ${item.category_name}`
    : item.category_name ?? 'Uncategorised';
}

function formatTemplateSubtitle(item: RecurringTransaction): string {
  const frequency = item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1);
  return item.note ? `${frequency} • ${item.note}` : frequency;
}

function formatAmount(item: RecurringTransaction): string {
  const sign = item.type === 'expense' ? '-' : '+';
  return `${sign}SGD ${item.amount.toFixed(2)}`;
}
