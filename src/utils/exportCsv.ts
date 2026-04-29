import RNFS from 'react-native-fs';
import {Transaction, Category} from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Escapes a single CSV field value per RFC 4180.
 * Wraps in quotes if the value contains commas, quotes, or newlines.
 */
function escapeField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildRow(fields: (string | number | null | undefined)[]): string {
  return fields.map(escapeField).join(',');
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function buildTransactionsCsv(transactions: Transaction[]): string {
  const header = buildRow([
    'id',
    'amount',
    'type',
    'date',
    'category_name',
    'note',
    'created_at',
    'updated_at',
  ]);

  const rows = transactions.map(t =>
    buildRow([
      t.id,
      t.amount,
      t.type,
      t.date,
      t.category_name ?? '',
      t.note ?? '',
      t.created_at,
      t.updated_at,
    ]),
  );

  return [header, ...rows].join('\n');
}

function buildCategoriesCsv(categories: Category[]): string {
  const header = buildRow(['id', 'name', 'color', 'is_archived']);

  const rows = categories.map(c =>
    buildRow([c.id, c.name, c.color, c.is_archived]),
  );

  return [header, ...rows].join('\n');
}

// ---------------------------------------------------------------------------
// File writing
// ---------------------------------------------------------------------------

export interface ExportResult {
  transactionsPath: string;
  categoriesPath: string;
}

/**
 * Writes transactions.csv and categories.csv to the device's Downloads folder.
 * Files are suffixed with the year-month for easy identification.
 *
 * @example exportToCsv(transactions, categories, 2024, 3)
 *   → Downloads/transactions_2024-03.csv
 *   → Downloads/categories_2024-03.csv
 */
export async function exportToCsv(
  transactions: Transaction[],
  categories: Category[],
  year: number,
  month: number,
): Promise<ExportResult> {
  const suffix = `${year}-${String(month).padStart(2, '0')}`;
  const basePath = RNFS.DownloadDirectoryPath;

  const transactionsPath = `${basePath}/transactions_${suffix}.csv`;
  const categoriesPath = `${basePath}/categories_${suffix}.csv`;

  // Both writes are independent — run in parallel, let Promise.all surface
  // individual errors without masking each other.
  await Promise.all([
    RNFS.writeFile(transactionsPath, buildTransactionsCsv(transactions), 'utf8'),
    RNFS.writeFile(categoriesPath, buildCategoriesCsv(categories), 'utf8'),
  ]);

  return {transactionsPath, categoriesPath};
}
