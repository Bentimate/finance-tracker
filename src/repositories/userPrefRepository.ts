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
      return {pay_cycle_day: null};
    }

    try {
      return JSON.parse(row.value) as UserSettings;
    } catch (e) {
      console.error('Failed to parse user settings', e);
      return {pay_cycle_day: null};
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
}

export const userPrefRepository = new UserPrefRepository();
