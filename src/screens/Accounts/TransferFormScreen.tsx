import React, {useEffect, useMemo, useState} from 'react';
import {Alert, TouchableOpacity, View, DeviceEventEmitter} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';

import {Button} from '../../components/Button';
import {Input} from '../../components/Input';
import {Screen} from '../../components/Screen';
import {Typography} from '../../components/Typography';
import {accountRepository} from '../../repositories/accountRepository';
import {AccountBalance, CreateTransferData} from '../../types';
import {formatCurrency} from '../../utils/formatCurrency';
import {styles} from './TransferFormScreen.styles';
import {AccountStackParamList} from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<AccountStackParamList, 'TransferForm'>;

const TransferFormScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [fromAccountId, setFromAccountId] = useState<number | null>(null);
  const [toAccountId, setToAccountId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAccounts = async () => {
      const data = await accountRepository.getAllWithBalances();
      setAccounts(data);
      if (data.length >= 2) {
        setFromAccountId(data[0].id);
        setToAccountId(data[1].id);
      }
    };

    void loadAccounts();
  }, []);

  const selectedFrom = useMemo(
    () => accounts.find(account => account.id === fromAccountId) ?? null,
    [accounts, fromAccountId],
  );
  const selectedTo = useMemo(
    () => accounts.find(account => account.id === toAccountId) ?? null,
    [accounts, toAccountId],
  );

  const handleSave = async () => {
    const value = parseFloat(amount);
    if (Number.isNaN(value) || value <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid transfer amount.');
      return;
    }

    if (!fromAccountId || !toAccountId) {
      Alert.alert('Account Required', 'Please choose both source and destination accounts.');
      return;
    }

    const payload: CreateTransferData = {
      from_account_id: fromAccountId,
      to_account_id: toAccountId,
      amount: value,
      note: note.trim() || undefined,
    };

    setLoading(true);
    try {
      await accountRepository.transfer(payload);
      DeviceEventEmitter.emit('AppRefresh');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Failed to transfer funds.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen withKeyboardAvoidingView scrollable edges={[]} contentStyle={styles.content} footer={<Button title="Transfer" onPress={handleSave} loading={loading} />}>
      <Typography variant="h2" weight="bold">
        Transfer Money
      </Typography>
      <Typography variant="body" color="textSecondary">
        Move cash between accounts without affecting your analytics totals.
      </Typography>

      <View style={styles.section}>
        <Typography variant="label" color="textSecondary">FROM</Typography>
        <TouchableOpacity style={styles.selector} onPress={() => {
          if (accounts.length > 0) {
            const currentIndex = accounts.findIndex(account => account.id === fromAccountId);
            const next = accounts[(currentIndex + 1) % accounts.length];
            setFromAccountId(next.id);
          }
        }}>
          <Typography variant="body" style={styles.selectorText}>
            {selectedFrom ? `${selectedFrom.name} · ${formatCurrency(selectedFrom.balance)}` : 'Select account'}
          </Typography>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Typography variant="label" color="textSecondary">TO</Typography>
        <TouchableOpacity style={styles.selector} onPress={() => {
          if (accounts.length > 0) {
            const currentIndex = accounts.findIndex(account => account.id === toAccountId);
            const next = accounts[(currentIndex + 1) % accounts.length];
            setToAccountId(next.id);
          }
        }}>
          <Typography variant="body" style={styles.selectorText}>
            {selectedTo ? `${selectedTo.name} · ${formatCurrency(selectedTo.balance)}` : 'Select account'}
          </Typography>
        </TouchableOpacity>
      </View>

      <Input label="AMOUNT" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" />
      <Input label="NOTE" value={note} onChangeText={setNote} placeholder="Optional note" />
    </Screen>
  );
};

export default TransferFormScreen;
