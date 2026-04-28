import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pick, isCancel } from '@react-native-documents/picker';
import { styles } from './SettingsScreen.styles';
import { exportToCsv } from '../../utils/csvExport';
import { detectAndImportCsv } from '../../utils/csvImport';

const SettingsScreen: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      const now = new Date();
      const result = await exportToCsv(now.getFullYear(), now.getMonth() + 1);

      if (result.success) {
        Alert.alert(
          'Export Successful',
          `Transactions and categories have been exported to your downloads folder.\n\nTransactions: ${result.transactionsPath}\n\nCategories: ${result.categoriesPath}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Export Failed', result.error ?? 'An unexpected error occurred.', [
          { text: 'OK' },
        ]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    try {
      const results = await pick({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
      });

      if (results.length === 0) return;

      const file = results[0];
      if (!file.name?.toLowerCase().endsWith('.csv')) {
        Alert.alert('Invalid File', 'Please select a CSV file.');
        return;
      }

      setIsProcessing(true);
      const result = await detectAndImportCsv(file.uri);

      if (result.success) {
        const typeLabel = result.type === 'transactions' ? 'transactions' : 'categories';
        Alert.alert(
          'Import Successful',
          `Successfully imported ${result.count} ${typeLabel}.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Import Failed', result.error ?? 'An unexpected error occurred.', [
          { text: 'OK' },
        ]);
      }
    } catch (err) {
      if (isCancel(err)) {
        // User cancelled the picker
      } else {
        Alert.alert('Error', 'An error occurred while picking the file.');
        console.error(err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Categories · CSV export · App preferences
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Portability</Text>
          <Text style={styles.sectionDescription}>
            Export your transaction history or import data from a CSV file.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.exportButton]}
              onPress={handleExport}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Export to CSV</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.importButton]}
              onPress={handleImport}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Import from CSV</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
