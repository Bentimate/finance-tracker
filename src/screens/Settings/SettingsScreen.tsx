import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useExport} from '../../hooks/useExport';
import {styles} from './SettingsScreen.styles';
import {MonthRow} from './components/MonthRow';
import {prevMonth, nextMonth} from './helpers';

const SettingsScreen: React.FC = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const {status, runExport, reset} = useExport();
  const isLoading = status.kind === 'loading';

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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Data Export</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Export Monthly Data</Text>
            <Text style={styles.cardBody}>
              Exports all transactions and categories for the selected month as
              CSV files to your Downloads folder.
            </Text>

            <MonthRow
              year={year}
              month={month}
              onPrev={handlePrev}
              onNext={handleNext}
            />

            <TouchableOpacity
              style={[styles.exportBtn, isLoading && styles.exportBtnDisabled]}
              onPress={handleExport}
              disabled={isLoading}
              activeOpacity={0.75}>
              {isLoading ? (
                <ActivityIndicator
                  color="#ffffff"
                  size="small"
                  style={styles.btnSpinner}
                />
              ) : null}
              <Text style={styles.exportBtnText}>
                {isLoading ? 'Exporting…' : 'Export to CSV'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.exportNote}>
              Files are saved to{' '}
              <Text style={styles.exportNoteMono}>Downloads/</Text> on your
              device and are not uploaded anywhere.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>About</Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutKey}>Version</Text>
              <Text style={styles.aboutValue}>1.1.0</Text>
            </View>
            <View style={[styles.aboutRow, styles.aboutRowLast]}>
              <Text style={styles.aboutKey}>Data storage</Text>
              <Text style={styles.aboutValue}>Local only</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
