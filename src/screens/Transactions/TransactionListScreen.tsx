import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {View, SectionList, DeviceEventEmitter, TouchableOpacity} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {Transaction, AccountBalance} from '../../types';
import {transactionRepository} from '../../repositories/transactionRepository';
import {accountRepository} from '../../repositories/accountRepository';
import {Typography} from '../../components/Typography';
import {Screen} from '../../components/Screen';
import {styles} from './styles/TransactionListScreen.styles';
import {AccountStackParamList, TransactionStackParamList} from '../../navigation/types';
import {useUserPrefs} from '../../context/UserPrefContext';
import {AccountPickerSheet} from '../../components/AccountPickerSheet';

import {TransactionItem} from './components/TransactionItem';
import {toDateStr, groupByDate, formatDateLabel, TransactionSection} from './helpers';
import {PlusButton} from '../../components/PlusButton';
import {styles as plusButtonStyles} from '../../components/styles/PlusButton.styles';
import {EmptyState} from '../../components/EmptyState';

type NavigationProp = NativeStackNavigationProp<TransactionStackParamList, 'TransactionForm'> &
  NativeStackNavigationProp<AccountStackParamList, 'AccountList'>;

const navigateToTransactionForm = (
  navigation: NavigationProp,
  params: {transactionId?: number; accountId?: number} | undefined,
) => {
  const parent = navigation.getParent?.();
  (parent as any)?.navigate('Calendar', {
    screen: 'TransactionForm',
    params,
  });
};

const TransactionListScreen: React.FC = () => {
  const [sections, setSections] = useState<TransactionSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [isAccountPickerVisible, setAccountPickerVisible] = useState(false);

  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
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
      if (selectedAccountId !== accountId) {
        setSelectedAccountId(accountId);
      }
      if (settings.transaction_scope_account_id !== accountId) {
        void updateSettings({transaction_scope_account_id: accountId});
      }
      if (!scopeReady) {
        setScopeReady(true);
      }
      return;
    }

    if (!prefsLoading && selectedAccountId !== settings.transaction_scope_account_id) {
      setSelectedAccountId(settings.transaction_scope_account_id);
    }
    if (!prefsLoading && !scopeReady) {
      setScopeReady(true);
    }
  }, [
    accountId,
    prefsLoading,
    scopeReady,
    selectedAccountId,
    settings.transaction_scope_account_id,
    updateSettings,
  ]);

  useEffect(() => {
    if (selectedAccountId === null) {
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

  const scopeLabel = selectedAccount ? selectedAccount.name : 'All accounts';

  return (
    <Screen
      edges={[]}
      header={
        <View>
          <TouchableOpacity
            style={styles.accountSelectorRow}
            onPress={() => setAccountPickerVisible(true)}
            activeOpacity={0.75}>
            <View>
              <Typography variant="caption" color="textMuted" style={styles.accountSelectorLabel}>
                Viewing
              </Typography>
              <Typography variant="body" weight="medium" style={styles.accountSelectorValue}>
                {scopeLabel}
              </Typography>
            </View>
            <Typography variant="caption" color="primary" weight="semibold">
              Change
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manageAccountsBtn}
            onPress={() => navigation.navigate('ManageAccounts')}
            activeOpacity={0.75}>
            <Typography variant="caption" color="primary" weight="semibold" style={styles.manageAccountsBtnText}>
              Manage accounts
            </Typography>
          </TouchableOpacity>
        </View>
      }>
      <AccountPickerSheet
        visible={isAccountPickerVisible}
        title="Transaction Scope"
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={async nextAccountId => {
          setSelectedAccountId(nextAccountId);
          setAccountPickerVisible(false);
          await updateSettings({transaction_scope_account_id: nextAccountId});
        }}
        onClose={() => setAccountPickerVisible(false)}
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
        onPress={() =>
          navigateToTransactionForm(navigation, {accountId: selectedAccountId ?? undefined})
        }
      />
    </Screen>
  );
};

export default TransactionListScreen;
