import RNFS from 'react-native-fs';
import {Transaction, Category} from '../types';

export interface ExportResult {
  transactionsPath: string;
  categoriesPath: string;
}

class CsvExporter {
  /**
   * Writes transactions.csv and categories.csv to the device's Downloads folder.
   */
  public async export(
    transactions: Transaction[],
    categories: Category[],
    year: number,
    month: number,
  ): Promise<ExportResult> {
    const suffix = `${year}-${String(month).padStart(2, '0')}`;
    const basePath = RNFS.DownloadDirectoryPath;

    const transactionsPath = `${basePath}/transactions_${suffix}.csv`;
    const categoriesPath = `${basePath}/categories_${suffix}.csv`;

    await Promise.all([
      RNFS.writeFile(transactionsPath, this.buildTransactionsCsv(transactions), 'utf8'),
      RNFS.writeFile(categoriesPath, this.buildCategoriesCsv(categories), 'utf8'),
    ]);

    return {transactionsPath, categoriesPath};
  }

  private buildTransactionsCsv(transactions: Transaction[]): string {
    const header = this.buildRow([
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
      this.buildRow([
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

  private buildCategoriesCsv(categories: Category[]): string {
    const header = this.buildRow(['id', 'name', 'color', 'is_archived']);

    const rows = categories.map(c =>
      this.buildRow([c.id, c.name, c.color, c.is_archived]),
    );

    return [header, ...rows].join('\n');
  }

  private buildRow(fields: (string | number | null | undefined)[]): string {
    return fields.map(this.escapeField).join(',');
  }

  private escapeField(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}

export const csvExporter = new CsvExporter();

/** @deprecated Use csvExporter.export */
export const exportToCsv = (
  transactions: Transaction[],
  categories: Category[],
  year: number,
  month: number,
) => csvExporter.export(transactions, categories, year, month);
