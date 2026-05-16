import {open, DB} from '@op-engineering/op-sqlite';
import RNFS from 'react-native-fs';
import {runMigrations} from './migrations';

type DatabaseState = 'idle' | 'initializing' | 'ready' | 'recovering' | 'failed';

const DB_NAME = 'finance_tracker.db';
const DB_HEALTHCHECK_SQL = 'SELECT 1 AS ok';
const PRAGMA_FOREIGN_KEYS = 'PRAGMA foreign_keys = ON';
const PRAGMA_JOURNAL_MODE = 'PRAGMA journal_mode = DELETE';
const PRAGMA_BUSY_TIMEOUT = 'PRAGMA busy_timeout = 5000';
const PRAGMA_SYNCHRONOUS = 'PRAGMA synchronous = FULL';

class Database {
  private dbInstance: DB | null = null;
  private initPromise: Promise<void> | null = null;
  private recoveryPromise: Promise<void> | null = null;
  private state: DatabaseState = 'idle';
  private readonly INITIALIZED_FLAG_PATH = `${RNFS.DocumentDirectoryPath}/.db_initialized`;

  public get instance(): DB {
    if (!this.dbInstance) {
      throw new Error(
        'Database not initialised. Await init() before accessing the DB.',
      );
    }
    return this.dbInstance;
  }

  public isReady(): boolean {
    return this.state === 'ready' && this.dbInstance !== null;
  }

  private log(event: string, error?: unknown): void {
    if (error) {
      console.error(event, error);
      return;
    }
    console.log(event);
  }

  private async applyPragmas(db: DB): Promise<void> {
    await db.execute(PRAGMA_FOREIGN_KEYS);
    await db.execute(PRAGMA_JOURNAL_MODE);
    await db.execute(PRAGMA_BUSY_TIMEOUT);
    await db.execute(PRAGMA_SYNCHRONOUS);
  }

  private async openAndPrepare(): Promise<void> {
    this.dbInstance = open({name: DB_NAME});
    await this.applyPragmas(this.dbInstance);
    await runMigrations(this.dbInstance);
  }

  private async writeInitializedFlag(): Promise<void> {
    try {
      await RNFS.writeFile(this.INITIALIZED_FLAG_PATH, 'ready', 'utf8');
    } catch (e) {
      console.error('Failed to write DB sentinel:', e);
    }
  }

  private async clearInitializedFlag(): Promise<void> {
    try {
      if (await RNFS.exists(this.INITIALIZED_FLAG_PATH)) {
        await RNFS.unlink(this.INITIALIZED_FLAG_PATH);
      }
    } catch (_e) {}
  }

  private async validateHandle(): Promise<void> {
    if (!this.dbInstance) {
      throw new Error('DB handle missing');
    }
    await this.dbInstance.execute(DB_HEALTHCHECK_SQL);
  }

  private clearHandle(): void {
    try {
      (this.dbInstance as any)?.close?.();
    } catch (_e) {}
    this.dbInstance = null;
  }

  public async init(): Promise<void> {
    if (this.isReady()) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      this.state = 'initializing';
      this.log('DB_INIT_START');
      try {
        await this.clearInitializedFlag();
        await this.openAndPrepare();
        await this.writeInitializedFlag();
        this.state = 'ready';
        this.log('DB_INIT_OK');
      } catch (error) {
        this.state = 'failed';
        this.clearHandle();
        this.log('DB_INIT_FAIL', error);
        throw error;
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  public async ensureReady(): Promise<void> {
    if (this.recoveryPromise) {
      return this.recoveryPromise;
    }

    if (!this.dbInstance || this.state !== 'ready') {
      return this.init();
    }

    try {
      await this.validateHandle();
      return;
    } catch (_e) {
      this.recoveryPromise = (async () => {
        this.state = 'recovering';
        this.log('DB_RECOVER_START');
        try {
          this.clearHandle();
          await this.openAndPrepare();
          await this.writeInitializedFlag();
          await this.validateHandle();
          this.state = 'ready';
          this.log('DB_RECOVER_OK');
        } catch (error) {
          this.state = 'failed';
          this.clearHandle();
          this.log('DB_RECOVER_FAIL', error);
          throw error;
        } finally {
          this.recoveryPromise = null;
        }
      })();

      return this.recoveryPromise;
    }
  }
}

export const database = new Database();

/** @deprecated Use database.instance */
export const getDb = () => database.instance;
/** @deprecated Use database.init() */
export const initDb = () => database.init();
