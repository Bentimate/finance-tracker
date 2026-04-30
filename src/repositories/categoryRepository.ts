import {getDb} from '../database/db';
import {QueryResult} from '@op-engineering/op-sqlite';
import {Category} from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rows<T>(result: QueryResult): T[] {
  return (result.rows as T[]) || [];
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * Returns all categories, optionally including archived ones.
 */
export async function getAllCategories(includeArchived = false): Promise<Category[]> {
  const result = await getDb().execute(
    includeArchived
      ? 'SELECT * FROM categories ORDER BY name COLLATE NOCASE'
      : 'SELECT * FROM categories WHERE is_archived = 0 ORDER BY name COLLATE NOCASE',
  );
  return rows<Category>(result);
}

/**
 * Returns a single category by primary key, or null.
 */
export async function getCategoryById(id: number): Promise<Category | null> {
  const result = await getDb().execute('SELECT * FROM categories WHERE id = ?', [id]);
  return rows<Category>(result)[0] ?? null;
}

/**
 * Returns true if the category has at least one non-deleted transaction.
 * Used to decide whether to hard-delete or archive (§3.2).
 */
export async function categoryHasTransactions(id: number): Promise<boolean> {
  const result = await getDb().execute(
    `SELECT COUNT(*) AS cnt
     FROM   transactions
     WHERE  category_id = ?
       AND  deleted_at IS NULL`,
    [id],
  );
  return (rows<{cnt: number}>(result)[0]?.cnt ?? 0) > 0;
}

/**
 * Returns a single category by name (case-insensitive), or null.
 */
export async function getCategoryByName(name: string): Promise<Category | null> {
  const result = await getDb().execute(
    'SELECT * FROM categories WHERE name = ? COLLATE NOCASE',
    [name.trim()],
  );
  return rows<Category>(result)[0] ?? null;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

interface CreateCategoryData {
  name: string;
  color: string;
}

/**
 * Inserts a new category.
 * Throws a user-friendly error on duplicate name (case-insensitive).
 */
export async function createCategory({
  name,
  color,
}: CreateCategoryData): Promise<number | undefined> {
  const trimmedName = name.trim();
  const db = getDb();

  await db.execute('BEGIN IMMEDIATE TRANSACTION');

  try {
    const existingResult = await db.execute(
      'SELECT id, is_archived FROM categories WHERE name = ? COLLATE NOCASE',
      [trimmedName],
    );
    const existing = rows<Category>(existingResult)[0];

    if (existing) {
      if (existing.is_archived === 0) {
        throw new Error(`A category named "${trimmedName}" already exists.`);
      } else {
        // Unarchive and update name/color
        await db.execute(
          'UPDATE categories SET is_archived = 0, name = ?, color = ? WHERE id = ?',
          [trimmedName, color, existing.id],
        );
        await db.execute('COMMIT');
        return existing.id;
      }
    }

    const result = await db.execute(
      'INSERT INTO categories (name, color) VALUES (?, ?)',
      [trimmedName, color],
    );

    await db.execute('COMMIT');

    return result.insertId;
  } catch (e) {
    await db.execute('ROLLBACK');
    throw e;
  }
}

/**
 * Updates the name and/or colour of a category.
 * Throws a user-friendly error on duplicate name.
 */
export async function updateCategory(
  id: number,
  {name, color}: CreateCategoryData,
): Promise<void> {
  const trimmedName = name.trim();
  const db = getDb();

  await db.execute('BEGIN IMMEDIATE TRANSACTION');

  try {
    const existing = await db.execute(
      'SELECT id FROM categories WHERE name = ? COLLATE NOCASE AND id != ?',
      [trimmedName, id],
    );

    if (rows(existing).length > 0) {
      throw new Error(`A category named "${trimmedName}" already exists.`);
    }

    await db.execute('UPDATE categories SET name = ?, color = ? WHERE id = ?', [
      trimmedName,
      color,
      id,
    ]);

    await db.execute('COMMIT');
  } catch (e) {
    await db.execute('ROLLBACK');
    throw e;
  }
}

/**
 * Archives a category so it no longer appears in active lists.
 * Preferred over deletion when the category has linked transactions (§3.2).
 */
export async function archiveCategory(id: number): Promise<void> {
  await getDb().execute('UPDATE categories SET is_archived = 1 WHERE id = ?', [
    id,
  ]);
}

/**
 * Restores a previously archived category.
 */
export async function unarchiveCategory(id: number): Promise<void> {
  await getDb().execute('UPDATE categories SET is_archived = 0 WHERE id = ?', [
    id,
  ]);
}

/**
 * Permanently deletes a category with no linked transactions.
 * Callers should check categoryHasTransactions() first and archive instead.
 */
export async function hardDeleteCategory(id: number): Promise<void> {
  await getDb().execute('DELETE FROM categories WHERE id = ?', [id]);
}
