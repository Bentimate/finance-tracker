import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {View, SectionList, DeviceEventEmitter, TouchableOpacity} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Menu} from 'react-native-paper';

import {Transaction, AccountBalance} from '../../types';
import {transactionRepository} from '../../repositories/transactionRepository';
import {accountRepository} from '../../repositories/accountRepository';
import {Typography} from '../../components/Typography';
import {Screen} from '../../components/Screen';
import {styles} from './styles/TransactionListScreen.styles';
import {AccountStackParamList, TransactionStackParamList} from '../../navigation/types';
import {useUserPrefs} from '../../context/UserPrefContext';
import {RecurringTransactionsSheet} from './components/RecurringTransactionsSheet';
import {Dropdown} from '../../components/Dropdown';

import {TransactionItem} from './components/TransactionItem';
import {toDateStr, groupByDate, formatDateLabel, TransactionSection} from './helpers';
import {PlusButton} from '../../components/PlusButton';
import {styles as plusButtonStyles} from '../../components/styles/PlusButton.styles';
import {EmptyState} from '../../components/EmptyState';
import {formatCurrency} from '../../utils/formatCurrency';
import {theme} from '../../theme';

type NavigationProp = NativeStackNavigationProp<AccountStackParamList, 'AccountList'>;

const navigateToTransactionForm = (
  navigation: NavigationProp,
  params: {transactionId?: number; accountId?: number} | undefined,
) => {
  navigation.navigate('TransactionForm', params);
};

const TransactionListScreen: React.FC = () => {
  const [sections, setSections] = useState<TransactionSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [isAccountPickerVisible, setAccountPickerVisible] = useState(false);
  const [isRecurringSheetVisible, setRecurringSheetVisible] = useState(false);

  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const handleRefresh = useCallback(async () => {
    DeviceEventEmitter.emit('AppRefresh');
    await loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    const params = route.params as any;
    if (params?.handleRefresh !== handleRefresh || params?.isLoading !== isLoading) {
      navigation.setParams({handleRefresh, isLoading} as any);
    }
  }, [navigation, handleRefresh, isLoading, route.params]);

  const accountId = (route.params as any)?.accountId as number | undefined;
  const {settings, updateSettings, loading: prefsLoading} = useUserPrefs();
  const [scopeReady, setScopeReady] = useState(false);
  const isMounted = React.useRef(true);

  const loadAccounts = useCallback(async () => {
    try {
      const data = await accountRepository.getAllWithBalances();
      if (isMounted.current) {
        setAccounts(data);
      }
    } catch (error) {
      console.error('Failed to load accounts', error);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    loadAccounts();
    return () => {
      isMounted.current = false;
    };
  }, [loadAccounts]);

  useEffect(() => {
    if (accountId !== undefined) {
      setSelectedAccountId(accountId);
      void updateSettings({transaction_scope_account_id: accountId});
      // Clear the param so it doesn't force this account if we change it manually later
      navigation.setParams({accountId: undefined} as any);
      setScopeReady(true);
      return;
    }

    if (!prefsLoading) {
      setSelectedAccountId(settings.transaction_scope_account_id);
      setScopeReady(true);
    }
  }, [accountId, prefsLoading, navigation, updateSettings]);

  useEffect(() => {
    if (!prefsLoading && accountId === undefined) {
      setSelectedAccountId(settings.transaction_scope_account_id);
    }
  }, [settings.transaction_scope_account_id, prefsLoading, accountId]);

  useEffect(() => {
    if (selectedAccountId === null || accounts.length === 0) {
      return;
    }
    const selectedStillExists = accounts.some(account => account.id === selectedAccountId);
    if (!selectedStillExists) {
      setSelectedAccountId(null);
      void updateSettings({transaction_scope_account_id: null});
    }
  }, [accounts, selectedAccountId, updateSettings]);

  const loadTransactions = useCallback(async () => {
    if (!scopeReady) {
      return;
    }

    setIsLoading(true);
    try {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 6);
      const data = await transactionRepository.getByWeek(
        toDateStr(weekStart),
        toDateStr(today),
        selectedAccountId ?? undefined,
      );
      setSections(groupByDate(data));
    } catch (e) {
      console.error('Failed to load transactions', e);
    } finally {
      setIsLoading(false);
    }
  }, [scopeReady, selectedAccountId]);

  useEffect(() => {
    const onAppRefresh = () => {
      loadTransactions();
    };
    const sub = DeviceEventEmitter.addListener('AppRefresh', onAppRefresh);
    return () => sub.remove();
  }, [loadTransactions]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  const handleTransactionPress = (id: number) => {
    navigateToTransactionForm(navigation, {transactionId: id});
  };

  const selectedAccount = useMemo(
    () => accounts.find(account => account.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  );

  const totalBalance = useMemo(() => {
    if (selectedAccountId) {
      return selectedAccount?.balance ?? 0;
    }
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  }, [accounts, selectedAccountId, selectedAccount]);

  const scopeLabel = selectedAccount ? selectedAccount.name : 'All accounts';
  const balanceLabel = selectedAccountId ? 'Account balance' : 'Total balance';

  return (
    <Screen
      edges={[]}
      header={
        <View>
          <View style={styles.accountSelectorHeader}>
            <Dropdown
              label="Viewing"
              value={scopeLabel}
              visible={isAccountPickerVisible}
              onDismiss={() => setAccountPickerVisible(false)}
              onPress={() => setAccountPickerVisible(true)}
              style={styles.dropdownButton}>
              <Menu.Item
                title="All accounts"
                onPress={async () => {
                  setSelectedAccountId(null);
                  setAccountPickerVisible(false);
                  await updateSettings({transaction_scope_account_id: null});
                }}
                titleStyle={
                  selectedAccountId === null
                    ? {color: theme.colors.primary, fontWeight: '700'}
                    : undefined
                }
              />
              {accounts.map(account => (
                <Menu.Item
                  key={account.id}
                  title={account.name}
                  onPress={async () => {
                    setSelectedAccountId(account.id);
                    setAccountPickerVisible(false);
                    await updateSettings({transaction_scope_account_id: account.id});
                  }}
                  titleStyle={
                    selectedAccountId === account.id
                      ? {color: theme.colors.primary, fontWeight: '700'}
                      : undefined
                  }
                />
              ))}
            </Dropdown>
            <TouchableOpacity
              style={styles.manageAccountsBtn}
              onPress={() => navigation.navigate('ManageAccounts')}
              activeOpacity={0.75}>
              <Typography variant="caption" color="primary" weight="semibold" style={styles.manageAccountsBtnText}>
                Manage
              </Typography>
            </TouchableOpacity>
          </View>

          <View style={styles.totalCard}>
            <Typography variant="caption" color="textMuted">
              {balanceLabel}
            </Typography>
            <Typography variant="h2" weight="bold" style={styles.totalBalance}>
              {formatCurrency(totalBalance)}
            </Typography>
          </View>
        </View>
      }>
      <RecurringTransactionsSheet
        visible={isRecurringSheetVisible}
        onClose={() => setRecurringSheetVisible(false)}
        onAdd={() => {
          setRecurringSheetVisible(false);
          navigation.navigate('RecurringTransactionForm', {
            accountId: selectedAccountId ?? undefined,
          });
        }}
        onEdit={id => {
          setRecurringSheetVisible(false);
          navigation.navigate('RecurringTransactionForm', {
            recurringTransactionId: id,
            accountId: selectedAccountId ?? undefined,
          });
        }}
      />

      <SectionList
        sections={sections}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => <TransactionItem item={item} onPress={handleTransactionPress} />}
        renderSectionHeader={({section: {title}}) => (
          <View style={styles.dayHeader}>
            <Typography variant="label" color="textMuted">
              {formatDateLabel(title)}
            </Typography>
          </View>
        )}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={<EmptyState message="No transactions for this period." />}
      />

      <PlusButton
        style={plusButtonStyles.fabLeft}
        label="R"
        onPress={() => setRecurringSheetVisible(true)}
      />
      <PlusButton
        onPress={() =>
          navigateToTransactionForm(navigation, {accountId: selectedAccountId ?? undefined})
        }
      />
    </Screen>
  );
};

export default TransactionListScreen;
