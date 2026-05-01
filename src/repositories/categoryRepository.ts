import {Category} from '../types';
import {BaseRepository} from './BaseRepository';

export interface CreateCategoryData {
  name: string;
  color: string;
}

class CategoryRepository extends BaseRepository {
  /**
   * Returns all categories, optionally including archived ones.
   */
  async getAll(includeArchived = false): Promise<Category[]> {
    const result = await this.db.execute(
      includeArchived
        ? 'SELECT * FROM categories ORDER BY name COLLATE NOCASE'
        : 'SELECT * FROM categories WHERE is_archived = 0 ORDER BY name COLLATE NOCASE',
    );
    return this.rows<Category>(result);
  }

  /**
   * Returns a single category by primary key, or null.
   */
  async getById(id: number): Promise<Category | null> {
    const result = await this.db.execute('SELECT * FROM categories WHERE id = ?', [id]);
    return this.first<Category>(result);
  }

  /**
   * Returns true if the category has at least one non-deleted transaction.
   * Used to decide whether to hard-delete or archive (§3.2).
   */
  async hasTransactions(id: number): Promise<boolean> {
    const result = await this.db.execute(
      `SELECT COUNT(*) AS cnt
       FROM   transactions
       WHERE  category_id = ?
         AND  deleted_at IS NULL`,
      [id],
    );
    return (this.first<{cnt: number}>(result)?.cnt ?? 0) > 0;
  }

  /**
   * Returns a single category by name (case-insensitive), or null.
   */
  async getByName(name: string): Promise<Category | null> {
    const result = await this.db.execute(
      'SELECT * FROM categories WHERE name = ? COLLATE NOCASE',
      [name.trim()],
    );
    return this.first<Category>(result);
  }

  /**
   * Inserts a new category.
   * Throws a user-friendly error on duplicate name (case-insensitive).
   */
  async create({name, color}: CreateCategoryData): Promise<number | undefined> {
    const trimmedName = name.trim();

    return this.withTransaction(async () => {
      const existing = await this.getByName(trimmedName);

      if (existing) {
        if (existing.is_archived === 0) {
          throw new Error(`A category named "${trimmedName}" already exists.`);
        } else {
          // Unarchive and update name/color
          await this.db.execute(
            'UPDATE categories SET is_archived = 0, name = ?, color = ? WHERE id = ?',
            [trimmedName, color, existing.id],
          );
          return existing.id;
        }
      }

      const result = await this.db.execute(
        'INSERT INTO categories (name, color) VALUES (?, ?)',
        [trimmedName, color],
      );

      return result.insertId;
    });
  }

  /**
   * Updates the name and/or colour of a category.
   * Throws a user-friendly error on duplicate name.
   */
  async update(id: number, {name, color}: CreateCategoryData): Promise<void> {
    const trimmedName = name.trim();

    await this.withTransaction(async () => {
      const existing = await this.db.execute(
        'SELECT id FROM categories WHERE name = ? COLLATE NOCASE AND id != ?',
        [trimmedName, id],
      );

      if (this.rows(existing).length > 0) {
        throw new Error(`A category named "${trimmedName}" already exists.`);
      }

      await this.db.execute('UPDATE categories SET name = ?, color = ? WHERE id = ?', [
        trimmedName,
        color,
        id,
      ]);
    });
  }

  /**
   * Archives a category so it no longer appears in active lists.
   * Preferred over deletion when the category has linked transactions (§3.2).
   */
  async archive(id: number): Promise<void> {
    await this.db.execute('UPDATE categories SET is_archived = 1 WHERE id = ?', [id]);
  }

  /**
   * Restores a previously archived category.
   */
  async unarchive(id: number): Promise<void> {
    await this.db.execute('UPDATE categories SET is_archived = 0 WHERE id = ?', [id]);
  }

  /**
   * Permanently deletes a category with no linked transactions.
   * Callers should check hasTransactions() first and archive instead.
   */
  async hardDelete(id: number): Promise<void> {
    await this.db.execute('DELETE FROM categories WHERE id = ?', [id]);
  }
}

export const categoryRepository = new CategoryRepository();
