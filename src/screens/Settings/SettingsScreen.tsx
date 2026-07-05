import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {useExport} from '../../hooks/useExport';
import {styles} from './SettingsScreen.styles';
import {MonthRow} from './components/MonthRow';
import {prevMonth, nextMonth} from './helpers';
import {Screen} from '../../components/Screen';
import {useUserPrefs} from '../../context/UserPrefContext';
import {accountRepository} from '../../repositories/accountRepository';
import {AccountBalance} from '../../types';
import {formatCurrency} from '../../utils/formatCurrency';
import {Menu} from 'react-native-paper';
import {theme} from '../../theme';
import {Dropdown} from '../../components/Dropdown';

const SettingsScreen: React.FC = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [isWidgetAccountPickerVisible, setWidgetAccountPickerVisible] = useState(false);

  const {settings, updateSettings} = useUserPrefs();
  const [payDayInput, setPayDayInput] = useState(
    settings.pay_cycle_day ? settings.pay_cycle_day.toString() : '',
  );

  const {status, runExport, reset} = useExport();
  const isLoading = status.kind === 'loading';

  useEffect(() => {
    setPayDayInput(settings.pay_cycle_day ? settings.pay_cycle_day.toString() : '');
  }, [settings.pay_cycle_day]);

  const loadAccounts = useCallback(async () => {
    try {
      const data = await accountRepository.getAllWithBalances();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts for settings', error);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    if (status.kind === 'success') {
      Alert.alert(
        'Export Complete',
        `Files saved to your Downloads folder:\n\n• transactions_${year}-${String(month).padStart(2, '0')}.csv\n• categories_${year}-${String(month).padStart(2, '0')}.csv`,
        [{text: 'OK', onPress: reset}],
      );
    }
    if (status.kind === 'error') {
      Alert.alert('Export Failed', status.message, [
        {text: 'OK', onPress: reset},
      ]);
    }
  }, [status.kind, year, month, reset]);

  const handleExport = () => {
    runExport(year, month);
  };

  const handlePrev = () => {
    const p = prevMonth(year, month);
    setYear(p.year);
    setMonth(p.month);
  };

  const handleNext = () => {
    const isCurrentMonth =
      year === now.getFullYear() && month === now.getMonth() + 1;
    if (!isCurrentMonth) {
      const n = nextMonth(year, month);
      setYear(n.year);
      setMonth(n.month);
    }
  };

  const handlePayDayChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned === '') {
      setPayDayInput('');
      return;
    }
    const val = parseInt(cleaned, 10);
    if (val >= 1 && val <= 31) {
      setPayDayInput(cleaned);
    }
  };

  const savePayDay = () => {
    const val = payDayInput === '' ? null : parseInt(payDayInput, 10);
    updateSettings({pay_cycle_day: val});
  };

  const resetPayDay = () => {
    updateSettings({pay_cycle_day: null});
  };

  const selectedWidgetAccount = accounts.find(account => account.id === settings.widget_account_id) ?? null;

  const saveWidgetAccount = async (accountId: number | null) => {
    await updateSettings({widget_account_id: accountId});
    setWidgetAccountPickerVisible(false);
  };

  return (
    <Screen edges={['bottom']} scrollable contentStyle={styles.scrollContent}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Pay Cycle Settings</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Start Day of Month</Text>
          <Text style={styles.cardBody}>
            Define which day of the month your pay cycle starts. If set, dashboard and budgets will
            sync with this cycle.
          </Text>

          <View style={styles.payCycleRow}>
            <TextInput
              style={styles.payCycleInput}
              value={payDayInput}
              onChangeText={handlePayDayChange}
              onBlur={savePayDay}
              placeholder="1-31"
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={styles.payCycleLabel}>
              {settings.pay_cycle_day
                ? `Starts on the ${settings.pay_cycle_day}${
                    [1, 21, 31].includes(settings.pay_cycle_day)
                      ? 'st'
                      : [2, 22].includes(settings.pay_cycle_day)
                      ? 'nd'
                      : [3, 23].includes(settings.pay_cycle_day)
                      ? 'rd'
                      : 'th'
                  } of each month`
                : 'Using standard calendar months (1st of month)'}
            </Text>
          </View>

          {settings.pay_cycle_day !== null && (
            <TouchableOpacity style={styles.resetBtn} onPress={resetPayDay}>
              <Text style={styles.resetBtnText}>Reset to Calendar Month</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Widget</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Default Entry Account</Text>
          <Text style={styles.cardBody}>
            Choose which account the widget saves to when you add a transaction from outside the
            app.
          </Text>

          <Dropdown
            label="Widget account"
            value={selectedWidgetAccount ? selectedWidgetAccount.name : 'Main account (default)'}
            visible={isWidgetAccountPickerVisible}
            onDismiss={() => setWidgetAccountPickerVisible(false)}
            onPress={() => setWidgetAccountPickerVisible(true)}
            style={styles.accountPickerBtn}>
            <Menu.Item
              title="Main account (default)"
              onPress={() => saveWidgetAccount(null)}
              titleStyle={
                settings.widget_account_id === null
                  ? {color: theme.colors.primary, fontWeight: '700'}
                  : undefined
              }
            />
            {accounts.map(account => (
              <Menu.Item
                key={account.id}
                title={account.name}
                onPress={() => saveWidgetAccount(account.id)}
                titleStyle={
                  settings.widget_account_id === account.id
                    ? {color: theme.colors.primary, fontWeight: '700'}
                    : undefined
                }
              />
            ))}
          </Dropdown>

          {settings.widget_account_id !== null && (
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => updateSettings({widget_account_id: null})}>
              <Text style={styles.resetBtnText}>Reset to Main Account</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Data Export</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Export Monthly Data</Text>
          <Text style={styles.cardBody}>
            Exports all transactions and categories for the selected month as CSV files to your
            Downloads folder.
          </Text>

          <MonthRow year={year} month={month} onPrev={handlePrev} onNext={handleNext} />

          <TouchableOpacity
            style={[styles.exportBtn, isLoading && styles.exportBtnDisabled]}
            onPress={handleExport}
            disabled={isLoading}
            activeOpacity={0.75}>
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" style={styles.btnSpinner} />
            ) : null}
            <Text style={styles.exportBtnText}>{isLoading ? 'Exporting…' : 'Export to CSV'}</Text>
          </TouchableOpacity>

          <Text style={styles.exportNote}>
            Files are saved to <Text style={styles.exportNoteMono}>Downloads/</Text> on your device
            and are not uploaded anywhere.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutKey}>Version</Text>
            <Text style={styles.aboutValue}>2.0.0</Text>
          </View>
          <View style={[styles.aboutRow, styles.aboutRowLast]}>
            <Text style={styles.aboutKey}>Data storage</Text>
            <Text style={styles.aboutValue}>Local only</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
};

export default SettingsScreen;
