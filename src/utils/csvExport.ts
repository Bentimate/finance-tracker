import RNFS from 'react-native-fs';
import { getTransactionsForExport } from '../repositories/transactionRepository';
import { getAllCategories } from '../repositories/categoryRepository';
import { Platform } from 'react-native';

/**
 * Escapes a string for CSV usage.
 * Wraps in double quotes and escapes existing double quotes.
 */
function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export interface ExportResult {
  success: boolean;
  transactionsPath?: string;
  categoriesPath?: string;
  error?: string;
}

/**
 * Exports transaction and category data to CSV files.
 * Files are stored in the document directory.
 */
export async function exportToCsv(year: number, month: number): Promise<ExportResult> {
  try {
    // 1. Fetch data from repositories with error handling
    const [transactions, categories] = await Promise.all([
      getTransactionsForExport(year, month),
      getAllCategories(true), // Include archived categories
    ]);

    // 2. Format Transactions CSV
    const transactionHeaders = ['ID', 'Amount', 'Type', 'Date', 'Category', 'Note', 'Created At'];
    const transactionRows = transactions.map(t => [
      t.id,
      t.amount,
      t.type,
      t.date,
      t.category_name ?? 'Unknown',
      t.note ?? '',
      t.created_at,
    ]);

    const transactionCsvContent = [
      transactionHeaders.join(','),
      ...transactionRows.map(row => row.map(escapeCsv).join(',')),
    ].join('\n');

    // 3. Format Categories CSV
    const categoryHeaders = ['ID', 'Name', 'Color', 'Is Archived'];
    const categoryRows = categories.map(c => [
      c.id,
      c.name,
      c.color,
      c.is_archived === 1 ? 'Yes' : 'No',
    ]);

    const categoryCsvContent = [
      categoryHeaders.join(','),
      ...categoryRows.map(row => row.map(escapeCsv).join(',')),
    ].join('\n');

    // 4. Define paths
    const baseDir = Platform.OS === 'android' ? RNFS.DownloadDirectoryPath : RNFS.DocumentDirectoryPath;
    const transactionsPath = `${baseDir}/transactions_${year}_${String(month).padStart(2, '0')}.csv`;
    const categoriesPath = `${baseDir}/categories.csv`;

    // 5. Write files
    await Promise.all([
      RNFS.writeFile(transactionsPath, transactionCsvContent, 'utf8'),
      RNFS.writeFile(categoriesPath, categoryCsvContent, 'utf8'),
    ]);

    return {
      success: true,
      transactionsPath,
      categoriesPath,
    };
  } catch (error: any) {
    console.error('Export to CSV failed:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred during export.',
    };
  }
}
