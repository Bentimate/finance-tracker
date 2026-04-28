import RNFS from 'react-native-fs';
import { getDb } from '../database/db';
import { getCategoryByName, createCategory, updateCategory, unarchiveCategory, archiveCategory } from '../repositories/categoryRepository';

/**
 * Very basic CSV parser that handles quotes and escapes.
 */
function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows.filter(row => row.length > 0 && row.some(field => field.trim() !== ''));
}

export interface ImportResult {
  success: boolean;
  type?: 'transactions' | 'categories';
  count?: number;
  error?: string;
}

/**
 * Imports transactions from a CSV file.
 */
async function importTransactionsFromCsv(dataRows: string[][], headers: string[]): Promise<ImportResult> {
  const idxAmount = headers.indexOf('amount');
  const idxType = headers.indexOf('type');
  const idxDate = headers.indexOf('date');
  const idxCategory = headers.indexOf('category');
  const idxNote = headers.indexOf('note');

  if (idxAmount === -1 || idxType === -1 || idxDate === -1 || idxCategory === -1) {
    return {
      success: false,
      error: 'CSV missing required headers for Transactions. Expected: Amount, Type, Date, Category'
    };
  }

  let importCount = 0;
  const db = getDb();

  await db.transaction(async (tx) => {
    for (const row of dataRows) {
      const amount = parseFloat(row[idxAmount]);
      const type = row[idxType]?.trim().toLowerCase() as 'income' | 'expense';
      const dateStr = row[idxDate]?.trim();
      const categoryName = row[idxCategory]?.trim();
      const note = idxNote !== -1 ? row[idxNote]?.trim() : null;

      if (isNaN(amount) || (type !== 'income' && type !== 'expense') || !dateStr || !categoryName) {
        continue;
      }

      let category = await getCategoryByName(categoryName);
      let categoryId: number | undefined;

      if (!category) {
        categoryId = await createCategory({ name: categoryName, color: '#6366f1' });
      } else {
        categoryId = category.id;
      }

      if (categoryId === undefined) continue;

      const now = new Date().toISOString();
      await tx.execute(
        `INSERT INTO transactions (amount, type, category_id, date, note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [amount, type, categoryId, dateStr, note, now, now]
      );
      importCount++;
    }
  });

  return { success: true, type: 'transactions', count: importCount };
}

/**
 * Imports categories from a CSV file.
 */
async function importCategoriesFromCsv(dataRows: string[][], headers: string[]): Promise<ImportResult> {
  const idxName = headers.indexOf('name');
  const idxColor = headers.indexOf('color');
  const idxArchived = headers.indexOf('is archived');

  if (idxName === -1 || idxColor === -1) {
    return {
      success: false,
      error: 'CSV missing required headers for Categories. Expected: Name, Color'
    };
  }

  let importCount = 0;
  const db = getDb();

  await db.transaction(async () => {
    for (const row of dataRows) {
      const name = row[idxName]?.trim();
      const color = row[idxColor]?.trim();
      const isArchived = idxArchived !== -1 ? row[idxArchived]?.trim().toLowerCase() === 'yes' : false;

      if (!name || !color) continue;

      let existing = await getCategoryByName(name);
      if (existing) {
        // Update existing category
        await updateCategory(existing.id, { name, color });
        if (isArchived) {
          await archiveCategory(existing.id);
        } else {
          await unarchiveCategory(existing.id);
        }
      } else {
        // Create new category
        const id = await createCategory({ name, color });
        if (id && isArchived) {
          await archiveCategory(id);
        }
      }
      importCount++;
    }
  });

  return { success: true, type: 'categories', count: importCount };
}

/**
 * Automatically detects CSV type and imports data.
 */
export async function detectAndImportCsv(fileUri: string): Promise<ImportResult> {
  try {
    const content = await RNFS.readFile(fileUri, 'utf8');
    const allRows = parseCsv(content);
    if (allRows.length < 2) {
      return { success: false, error: 'CSV file is empty or missing data.' };
    }

    const headers = allRows[0].map(h => h.trim().toLowerCase());
    const dataRows = allRows.slice(1);

    // Detect type based on headers
    if (headers.includes('amount') && headers.includes('category')) {
      return await importTransactionsFromCsv(dataRows, headers);
    } else if (headers.includes('name') && headers.includes('color')) {
      return await importCategoriesFromCsv(dataRows, headers);
    } else {
      return {
        success: false,
        error: 'Unrecognized CSV format. Please ensure the file has the correct headers.'
      };
    }
  } catch (error: any) {
    console.error('Import from CSV failed:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred during import.',
    };
  }
}
