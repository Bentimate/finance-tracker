import {Category} from '../types';
import {BaseRepository} from './BaseRepository';

class ExportRepository extends BaseRepository {
  /**
   * Returns all categories (including archived) for CSV export.
   */
  async getCategoriesForExport(): Promise<Category[]> {
    const result = await this.db.execute(
      'SELECT * FROM categories ORDER BY name COLLATE NOCASE',
    );
    return this.rows<Category>(result);
  }
}

export const exportRepository = new ExportRepository();
