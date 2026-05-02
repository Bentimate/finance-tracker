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

  protected toDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  protected currentWeekBounds(date: Date): {startDate: string; endDate: string} {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      startDate: this.toDateStr(monday),
      endDate: this.toDateStr(sunday),
    };
  }

  protected currentMonthBounds(date: Date): {startDate: string; endDate: string} {
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    return {
      startDate: this.toDateStr(first),
      endDate: this.toDateStr(last),
    };
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
