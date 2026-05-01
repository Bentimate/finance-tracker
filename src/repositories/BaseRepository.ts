import {QueryResult} from '@op-engineering/op-sqlite';
import {database} from '../database/db';

export abstract class BaseRepository {
  protected get db() {
    return database.instance;
  }

  protected rows<T>(result: QueryResult): T[] {
    return (result.rows as T[]) || [];
  }

  protected first<T>(result: QueryResult): T | null {
    const data = this.rows<T>(result);
    return data.length > 0 ? data[0] : null;
  }

  protected now(): string {
    return new Date().toISOString();
  }

  protected async withTransaction<T>(callback: () => Promise<T>): Promise<T> {
    await this.db.execute('BEGIN IMMEDIATE TRANSACTION');
    try {
      const result = await callback();
      await this.db.execute('COMMIT');
      return result;
    } catch (e) {
      await this.db.execute('ROLLBACK');
      throw e;
    }
  }
}
