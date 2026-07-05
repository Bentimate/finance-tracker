import React, {useCallback, useEffect, useState} from 'react';
import {Alert, FlatList, View, DeviceEventEmitter} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';

import {AccountBalance} from '../../types';
import {accountRepository} from '../../repositories/accountRepository';
import {Screen} from '../../components/Screen';
import {Typography} from '../../components/Typography';
import {Button} from '../../components/Button';
import {PlusButton} from '../../components/PlusButton';
import {EmptyState} from '../../components/EmptyState';
import {formatCurrency} from '../../utils/formatCurrency';
import {styles} from './AccountsScreen.styles';

const AccountsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountRepository.getAllWithBalances();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    DeviceEventEmitter.emit('AppRefresh');
    await loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    const params = route.params as any;
    if (params?.handleRefresh !== handleRefresh || params?.isLoading !== loading) {
      navigation.setParams({handleRefresh, isLoading: loading} as any);
    }
  }, [navigation, handleRefresh, loading, route.params]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('AppRefresh', loadAccounts);
    return () => sub.remove();
  }, [loadAccounts]);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [loadAccounts]),
  );

  const handleDelete = useCallback(
    (account: AccountBalance) => {
      Alert.alert(
        'Remove Account',
        `Remove ${account.name}? Accounts with transactions or transfers must be emptied first.`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                await accountRepository.delete(account.id);
                DeviceEventEmitter.emit('AppRefresh');
                await loadAccounts();
              } catch (error: any) {
                Alert.alert('Cannot Remove Account', error?.message ?? 'Failed to remove account.');
              }
            },
          },
        ],
      );
    },
    [loadAccounts],
  );

  return (
    <Screen edges={[]} style={styles.screen}>
      <FlatList
        data={accounts}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadAccounts}
        ListEmptyComponent={
          <EmptyState message="No accounts yet. Create one to start tracking balances." />
        }
      renderItem={({item}) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.accountMeta}>
              <Typography variant="body" weight="bold">
                {item.name}
              </Typography>
              {item.is_default === 1 && (
                <Typography variant="caption" color="textSecondary">
                  Default account
                </Typography>
              )}
            </View>
            <Typography variant="body" weight="bold" style={styles.balance}>
              {formatCurrency(item.balance)}
            </Typography>
          </View>
          <View style={styles.actions}>
            <Button
              title="Rename"
              variant="outline"
              size="sm"
              onPress={() => navigation.navigate('AccountForm', {accountId: item.id})}
              style={styles.actionButton}
            />
            <Button
              title="Remove"
              variant="danger"
              size="sm"
              onPress={() => handleDelete(item)}
              style={styles.actionButton}
              disabled={item.is_default === 1}
            />
          </View>
        </View>
      )}
      />

      <PlusButton onPress={() => navigation.navigate('AccountForm', {})} />
    </Screen>
  );
};

export default AccountsScreen;
