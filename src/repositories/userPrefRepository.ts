import {BaseRepository} from './BaseRepository';
import {UserSettings} from '../types';

class UserPrefRepository extends BaseRepository {
  private readonly SETTINGS_KEY = 'global_settings';

  async getSettings(): Promise<UserSettings> {
    const result = await this.db.execute(
      'SELECT value FROM user_preferences WHERE key = ?',
      [this.SETTINGS_KEY],
    );

    const row = this.first<{value: string}>(result);
    if (!row) {
      return this.defaultSettings();
    }

    try {
      return {...this.defaultSettings(), ...(JSON.parse(row.value) as Partial<UserSettings>)};
    } catch (e) {
      console.error('Failed to parse user settings', e);
      return this.defaultSettings();
    }
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    const current = await this.getSettings();
    const updated = {...current, ...settings};

    await this.db.execute(
      'INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)',
      [this.SETTINGS_KEY, JSON.stringify(updated)],
    );
  }

  async getPreference<T>(key: string, defaultValue: T): Promise<T> {
    const result = await this.db.execute('SELECT value FROM user_preferences WHERE key = ?', [key]);
    const row = this.first<{value: string}>(result);
    if (!row) {
      return defaultValue;
    }

    try {
      return JSON.parse(row.value) as T;
    } catch (e) {
      console.error(`Failed to parse preference ${key}`, e);
      return defaultValue;
    }
  }

  async setPreference<T>(key: string, value: T): Promise<void> {
    await this.db.execute('INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)', [
      key,
      JSON.stringify(value),
    ]);
  }

  private defaultSettings(): UserSettings {
    return {
      pay_cycle_day: null,
      transaction_scope_account_id: null,
      widget_account_id: null,
    };
  }
}

export const userPrefRepository = new UserPrefRepository();
