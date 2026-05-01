import React, {useState, useEffect} from 'react';
import {View, Modal, TouchableOpacity, FlatList, ActivityIndicator} from 'react-native';
import {Typography} from '../../../components/Typography';
import {Transaction} from '../../../types';
import {transactionRepository} from '../../../repositories/transactionRepository';
import {TransactionItem} from './TransactionItem';
import {styles} from '../styles/DayTransactionsSheet.styles';
import {toDateStr} from '../helpers';
import {theme} from '../../../theme';

interface DayTransactionsSheetProps {
  visible: boolean;
  date: Date | null;
  onClose: () => void;
  onTransactionPress: (id: number) => void;
}

export const DayTransactionsSheet: React.FC<DayTransactionsSheetProps> = ({
  visible,
  date,
  onClose,
  onTransactionPress,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && date) {
      loadTransactions();
    }
  }, [visible, date]);

  const loadTransactions = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const data = await transactionRepository.getByDay(toDateStr(date));
      setTransactions(data);
    } catch (e) {
      console.error('Failed to load day transactions', e);
    } finally {
      setLoading(false);
    }
  };

  if (!date) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.sheet}
          activeOpacity={1}
          onPress={() => {}} // Prevent closing when tapping inside the sheet
        >
          <View style={styles.header}>
            <Typography variant="h3">
              {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Typography>
            <TouchableOpacity onPress={onClose}>
              <Typography color="primary" weight="bold">Done</Typography>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => (
                <TransactionItem
                  item={item}
                  onPress={(id) => {
                    onClose(); // Close sheet before navigating
                    onTransactionPress(id);
                  }}
                />
              )}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Typography color="textMuted">No transactions for this day.</Typography>
                </View>
              }
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
