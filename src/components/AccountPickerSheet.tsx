import React from 'react';
import {View} from 'react-native';

import {BottomSheet} from './BottomSheet';
import {EmptyState} from './EmptyState';
import {ListItem} from './ListItem';
import {Typography} from './Typography';
import {AccountBalance} from '../types';
import {formatCurrency} from '../utils/formatCurrency';
import {styles} from './styles/AccountPickerSheet.styles';

interface Props {
  visible: boolean;
  title: string;
  accounts: AccountBalance[];
  selectedAccountId: number | null;
  allowAllAccounts?: boolean;
  onSelectAccount: (accountId: number | null) => void;
  onClose: () => void;
}

export const AccountPickerSheet: React.FC<Props> = ({
  visible,
  title,
  accounts,
  selectedAccountId,
  allowAllAccounts = true,
  onSelectAccount,
  onClose,
}) => {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Typography variant="h3">{title}</Typography>
      </View>

      <View style={styles.list}>
        {allowAllAccounts && (
          <ListItem
            title="All accounts"
            subtitle="Show transactions from every account"
            selected={selectedAccountId === null}
            onPress={() => onSelectAccount(null)}
            style={styles.item}
          />
        )}

        {accounts.length === 0 ? (
          <EmptyState message="No accounts available." />
        ) : (
          accounts.map(account => (
            <ListItem
              key={account.id}
              title={account.name}
              subtitle={account.is_default === 1 ? 'Default account' : undefined}
              selected={selectedAccountId === account.id}
              onPress={() => onSelectAccount(account.id)}
              rightElement={
                <Typography variant="caption" weight="bold" style={styles.balance}>
                  {formatCurrency(account.balance)}
                </Typography>
              }
              style={styles.item}
            />
          ))
        )}
      </View>
    </BottomSheet>
  );
};
