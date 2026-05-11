import {Category, ParentCategory} from '../types';
import {BaseRepository} from './BaseRepository';

export interface CreateCategoryData {
  name: string;
  color: string;
  icon?: string | null;
  parentId?: number | null;
}

class CategoryRepository extends BaseRepository {
  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  /**
   * Returns all categories as a flat list, optionally including archived ones.
   * Existing callers are unaffected.
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
   * Returns all root categories with their active children hydrated.
   * Each parent includes a `children` array (empty if standalone).
   * Archived categories are excluded from both levels.
   */
  async getAllNested(): Promise<ParentCategory[]> {
    const result = await this.db.execute(
      'SELECT * FROM categories WHERE is_archived = 0 ORDER BY name COLLATE NOCASE',
    );
    const all = this.rows<Category>(result);

    const roots = all.filter(c => c.parent_id === null);
    const childrenByParent = new Map<number, Category[]>();

    for (const c of all) {
      if (c.parent_id !== null) {
        const siblings = childrenByParent.get(c.parent_id) ?? [];
        siblings.push(c);
        childrenByParent.set(c.parent_id, siblings);
      }
    }

    return roots.map(root => ({
      ...root,
      children: childrenByParent.get(root.id) ?? [],
    }));
  }

  /**
   * Returns the active children of a given parent category.
   */
  async getChildren(parentId: number): Promise<Category[]> {
    const result = await this.db.execute(
      'SELECT * FROM categories WHERE parent_id = ? AND is_archived = 0 ORDER BY name COLLATE NOCASE',
      [parentId],
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
   * Used to decide whether to hard-delete or archive.
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
   * Returns true if the category has any active (non-archived) children.
   */
  async hasChildren(id: number): Promise<boolean> {
    const result = await this.db.execute(
      'SELECT COUNT(*) AS cnt FROM categories WHERE parent_id = ? AND is_archived = 0',
      [id],
    );
    return (this.first<{cnt: number}>(result)?.cnt ?? 0) > 0;
  }

  /**
   * Returns true if a category is the first child being added to the given
   * parent — i.e. the parent currently has zero active children.
   * Used by the form to decide whether to show the "Others" warning.
   */
  async isFirstChild(parentId: number): Promise<boolean> {
    const result = await this.db.execute(
      'SELECT COUNT(*) AS cnt FROM categories WHERE parent_id = ? AND is_archived = 0',
      [parentId],
    );
    return (this.first<{cnt: number}>(result)?.cnt ?? 0) === 0;
  }

  /**
   * Looks up a category by name within the correct uniqueness scope:
   *   - parentId === null  → search among roots only
   *   - parentId provided  → search among children of that parent only
   */
  private async getByNameInScope(
    name: string,
    parentId: number | null,
  ): Promise<Category | null> {
    const result =
      parentId === null
        ? await this.db.execute(
            'SELECT * FROM categories WHERE name = ? COLLATE NOCASE AND parent_id IS NULL',
            [name.trim()],
          )
        : await this.db.execute(
            'SELECT * FROM categories WHERE name = ? COLLATE NOCASE AND parent_id = ?',
            [name.trim(), parentId],
          );
    return this.first<Category>(result);
  }

  // ---------------------------------------------------------------------------
  // Writes
  // ---------------------------------------------------------------------------

  /**
   * Inserts a new category.
   *
   * Validations (all throw user-friendly errors):
   *   - Name "Others" is reserved for child categories.
   *   - Parent, if supplied, must itself be a root (max depth = 2).
   *   - Name must be unique within the correct scope (root or per-parent).
   *
   * Unarchive shortcut: if the name matches a soft-archived category in the
   * same scope, it is unarchived and updated rather than duplicated.
   */
  async create({
    name,
    color,
    icon = null,
    parentId = null,
  }: CreateCategoryData): Promise<number | undefined> {
    const trimmedName = name.trim();

    return this.withTransaction(async () => {
      // Guard: "Others" is reserved for the virtual bucket
      if (parentId !== null && trimmedName.toLowerCase() === 'others') {
        throw new Error('"Others" is a reserved name and cannot be used for a subcategory.');
      }

      // Guard: parent must be a root (depth limit = 2)
      if (parentId !== null) {
        const parent = await this.getById(parentId);
        if (!parent) {
          throw new Error('Selected parent category does not exist.');
        }
        if (parent.parent_id !== null) {
          throw new Error('Categories can only be nested one level deep.');
        }
      }

      const existing = await this.getByNameInScope(trimmedName, parentId);

      if (existing) {
        if (existing.is_archived === 0) {
          throw new Error(`A category named "${trimmedName}" already exists.`);
        }
        // Unarchive and refresh the existing record
        await this.db.execute(
          'UPDATE categories SET is_archived = 0, name = ?, color = ?, icon = ?, parent_id = ? WHERE id = ?',
          [trimmedName, color, icon, parentId, existing.id],
        );
        return existing.id;
      }

      const result = await this.db.execute(
        'INSERT INTO categories (name, color, icon, parent_id) VALUES (?, ?, ?, ?)',
        [trimmedName, color, icon, parentId],
      );

      return result.insertId;
    });
  }

  /**
   * Updates a category's mutable fields.
   *
   * Validations:
   *   - Name "Others" is reserved for child categories.
   *   - A category that has active children cannot be reparented.
   *   - Name must be unique within the correct scope, excluding this record.
   */
  async update(
    id: number,
    {name, color, icon = null, parentId = null}: CreateCategoryData,
  ): Promise<void> {
    const trimmedName = name.trim();

    await this.withTransaction(async () => {
      // Guard: "Others" reserved
      if (parentId !== null && trimmedName.toLowerCase() === 'others') {
        throw new Error('"Others" is a reserved name and cannot be used for a subcategory.');
      }

      // Guard: cannot reparent a category that has children
      const childCount = await this.db.execute(
        'SELECT COUNT(*) AS cnt FROM categories WHERE parent_id = ? AND is_archived = 0',
        [id],
      );
      const hasChildren = (this.first<{cnt: number}>(childCount)?.cnt ?? 0) > 0;

      const current = await this.getById(id);
      if (hasChildren && current?.parent_id !== parentId) {
        throw new Error('A category that has subcategories cannot be moved to a different parent.');
      }

      // Guard: parent must be a root
      if (parentId !== null) {
        const parent = await this.getById(parentId);
        if (!parent) {
          throw new Error('Selected parent category does not exist.');
        }
        if (parent.parent_id !== null) {
          throw new Error('Categories can only be nested one level deep.');
        }
      }

      // Uniqueness check within the correct scope, excluding self
      const duplicate =
        parentId === null
          ? await this.db.execute(
              'SELECT id FROM categories WHERE name = ? COLLATE NOCASE AND parent_id IS NULL AND id != ?',
              [trimmedName, id],
            )
          : await this.db.execute(
              'SELECT id FROM categories WHERE name = ? COLLATE NOCASE AND parent_id = ? AND id != ?',
              [trimmedName, parentId, id],
            );

      if (this.rows(duplicate).length > 0) {
        throw new Error(`A category named "${trimmedName}" already exists.`);
      }

      await this.db.execute(
        'UPDATE categories SET name = ?, color = ?, icon = ?, parent_id = ? WHERE id = ?',
        [trimmedName, color, icon, parentId, id],
      );
    });
  }

  /**
   * Archives a category.
   * If the category has active children, all children are cascade-archived
   * in the same atomic write.
   *
   * The caller (UI) is responsible for showing the confirmation dialog before
   * calling this when hasChildren() returns true.
   */
  async archive(id: number): Promise<void> {
    await this.withTransaction(async () => {
      // Cascade to children first
      await this.db.execute(
        'UPDATE categories SET is_archived = 1 WHERE parent_id = ?',
        [id],
      );
      await this.db.execute(
        'UPDATE categories SET is_archived = 1 WHERE id = ?',
        [id],
      );
    });
  }

  /**
   * Restores a previously archived category.
   * Children are NOT automatically unarchived — the user restores them
   * individually if needed.
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