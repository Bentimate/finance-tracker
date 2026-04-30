import {getDb} from '../database/db';
import {QueryResult} from '@op-engineering/op-sqlite';
import {Category} from '../types';

function rows<T>(result: QueryResult): T[] {
  return (result.rows as T[]) || [];
}

/**
 * Returns all categories (including archived) for CSV export.
 * Archived categories are included so exported data stays complete
 * and supports future re-import compatibility (§5.4).
 */
export async function getCategoriesForExport(): Promise<Category[]> {
  const result = await getDb().execute(
    'SELECT * FROM categories ORDER BY name COLLATE NOCASE',
  );
  return rows<Category>(result);
}
