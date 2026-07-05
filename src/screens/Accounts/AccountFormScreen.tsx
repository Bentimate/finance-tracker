import React, {useEffect, useState} from 'react';
import {Alert, DeviceEventEmitter} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {Button} from '../../components/Button';
import {Input} from '../../components/Input';
import {Screen} from '../../components/Screen';
import {Typography} from '../../components/Typography';
import {accountRepository} from '../../repositories/accountRepository';
import {AccountStackParamList} from '../../navigation/types';
import {styles} from './AccountFormScreen.styles';

type NavigationProp = NativeStackNavigationProp<AccountStackParamList, 'AccountForm'>;
type FormRouteProp = RouteProp<AccountStackParamList, 'AccountForm'>;

const AccountFormScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FormRouteProp>();
  const accountId = route.params?.accountId;

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const loadAccount = async () => {
      if (!accountId) {
        return;
      }
      const account = await accountRepository.getById(accountId);
      if (account) {
        setName(account.name);
        setIsEdit(true);
      }
    };

    void loadAccount();
  }, [accountId]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Account Name Required', 'Please enter a name for the account.');
      return;
    }

    setLoading(true);
    try {
      if (accountId) {
        await accountRepository.rename(accountId, trimmed);
      } else {
        await accountRepository.create({name: trimmed});
      }
      DeviceEventEmitter.emit('AppRefresh');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Failed to save account.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!accountId) {
      return;
    }

    Alert.alert('Remove Account', 'This account will be removed only if it has no history.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await accountRepository.delete(accountId);
            DeviceEventEmitter.emit('AppRefresh');
            navigation.goBack();
          } catch (error: any) {
            Alert.alert('Cannot Remove Account', error?.message ?? 'Failed to remove account.');
          }
        },
      },
    ]);
  };

  return (
    <Screen
      withKeyboardAvoidingView
      scrollable
      edges={[]}
      contentStyle={styles.content}
      footer={
        <>
          {isEdit && (
            <Button
              title="Remove"
              variant="outline"
              onPress={handleDelete}
              style={styles.footerDeleteButton}
              textStyle={styles.note}
            />
          )}
          <Button
            title={isEdit ? 'Rename Account' : 'Create Account'}
            onPress={handleSave}
            loading={loading}
          />
        </>
      }>
      <Typography variant="h2" weight="bold">
        {isEdit ? 'Rename Account' : 'New Account'}
      </Typography>
      <Typography variant="body" color="textSecondary">
        Accounts keep their own transaction history and balance.
      </Typography>
      <Input
        label="ACCOUNT NAME"
        value={name}
        onChangeText={setName}
        placeholder="Main"
        autoFocus={!isEdit}
      />
    </Screen>
  );
};

export default AccountFormScreen;
