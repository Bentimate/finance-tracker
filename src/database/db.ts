import {open, DB} from '@op-engineering/op-sqlite';
import RNFS from 'react-native-fs';
import {runMigrations} from './migrations';

class Database {
  private dbInstance: DB | null = null;
  private initPromise: Promise<void> | null = null;
  private readonly INITIALIZED_FLAG_PATH = `${RNFS.DocumentDirectoryPath}/.db_initialized`;

  public get instance(): DB {
    if (!this.dbInstance) {
      throw new Error(
        'Database not initialised. Await init() before accessing the DB.',
      );
    }
    return this.dbInstance;
  }

  public async init(): Promise<void> {
    if (this.dbInstance) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        if (await RNFS.exists(this.INITIALIZED_FLAG_PATH)) {
          await RNFS.unlink(this.INITIALIZED_FLAG_PATH);
        }
      } catch (e) {}

      this.dbInstance = open({name: 'finance_tracker.db'});

      // Enable foreign-key enforcement
      await this.dbInstance.execute('PRAGMA foreign_keys = ON');

      // Use DELETE journal mode instead of WAL.
      await this.dbInstance.execute('PRAGMA journal_mode = DELETE');

      // Wait up to 5s if the database is locked by another process
      await this.dbInstance.execute('PRAGMA busy_timeout = 5000');

      // Ensure transactions are durable
      await this.dbInstance.execute('PRAGMA synchronous = FULL');

      await runMigrations(this.dbInstance);

      try {
        await RNFS.writeFile(this.INITIALIZED_FLAG_PATH, 'ready', 'utf8');
      } catch (e) {
        console.error('Failed to write DB sentinel:', e);
      }
    })();

    return this.initPromise;
  }
}

export const database = new Database();

/** @deprecated Use database.instance */
export const getDb = () => database.instance;
/** @deprecated Use database.init() */
export const initDb = () => database.init();
