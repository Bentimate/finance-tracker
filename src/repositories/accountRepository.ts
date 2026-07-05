import {Account, AccountBalance, CreateTransferData} from '../types';
import {BaseRepository} from './BaseRepository';

export interface CreateAccountData {
  name: string;
}

class AccountRepository extends BaseRepository {
  private async getByName(name: string, excludeId?: number): Promise<Account | null> {
    const result = excludeId
      ? await this.db.execute(
          'SELECT * FROM accounts WHERE name = ? COLLATE NOCASE AND id != ? AND deleted_at IS NULL',
          [name.trim(), excludeId],
        )
      : await this.db.execute(
          'SELECT * FROM accounts WHERE name = ? COLLATE NOCASE AND deleted_at IS NULL',
          [name.trim()],
        );
    return this.first<Account>(result);
  }

  async getAll(): Promise<Account[]> {
    const result = await this.db.execute(
      'SELECT * FROM accounts WHERE deleted_at IS NULL ORDER BY is_default DESC, name COLLATE NOCASE',
    );
    return this.rows<Account>(result);
  }

  async getById(id: number): Promise<Account | null> {
    const result = await this.db.execute('SELECT * FROM accounts WHERE id = ? AND deleted_at IS NULL', [id]);
    return this.first<Account>(result);
  }

  async getDefaultAccount(): Promise<Account | null> {
    const result = await this.db.execute(
      'SELECT * FROM accounts WHERE deleted_at IS NULL ORDER BY is_default DESC, id ASC LIMIT 1',
    );
    return this.first<Account>(result);
  }

  async getAllWithBalances(): Promise<AccountBalance[]> {
    const result = await this.db.execute(
      `WITH transaction_totals AS (
         SELECT account_id,
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS balance
         FROM transactions
         WHERE deleted_at IS NULL
         GROUP BY account_id
       ),
       transfer_totals AS (
         SELECT account_id,
                COALESCE(SUM(delta), 0) AS balance
         FROM (
           SELECT to_account_id AS account_id, amount AS delta
           FROM account_transfers
           WHERE deleted_at IS NULL
           UNION ALL
           SELECT from_account_id AS account_id, -amount AS delta
           FROM account_transfers
           WHERE deleted_at IS NULL
         )
         GROUP BY account_id
       )
       SELECT a.*,
              COALESCE(tt.balance, 0) + COALESCE(tf.balance, 0) AS balance
       FROM accounts a
       LEFT JOIN transaction_totals tt ON tt.account_id = a.id
       LEFT JOIN transfer_totals tf ON tf.account_id = a.id
       WHERE a.deleted_at IS NULL
       ORDER BY a.is_default DESC, a.name COLLATE NOCASE`,
    );
    return this.rows<AccountBalance>(result);
  }

  async create(data: CreateAccountData): Promise<number | undefined> {
    const name = data.name.trim();
    return this.withTransaction(async () => {
      const duplicate = await this.getByName(name);
      if (duplicate) {
        throw new Error(`An account named "${name}" already exists.`);
      }
      const result = await this.db.execute(
        'INSERT INTO accounts (name, is_default, created_at, updated_at) VALUES (?, 0, ?, ?)',
        [name, this.now(), this.now()],
      );
      return result.insertId;
    });
  }

  async rename(id: number, name: string): Promise<void> {
    await this.withTransaction(async () => {
      const duplicate = await this.getByName(name, id);
      if (duplicate) {
        throw new Error(`An account named "${name.trim()}" already exists.`);
      }
      await this.db.execute(
        'UPDATE accounts SET name = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL',
        [name.trim(), this.now(), id],
      );
    });
  }

  async canDelete(id: number): Promise<boolean> {
    const [txnResult, recurringResult, transferResult] = await Promise.all([
      this.db.execute('SELECT COUNT(*) AS cnt FROM transactions WHERE account_id = ? AND deleted_at IS NULL', [id]),
      this.db.execute('SELECT COUNT(*) AS cnt FROM recurring_transactions WHERE account_id = ? AND deleted_at IS NULL', [id]),
      this.db.execute(
        'SELECT COUNT(*) AS cnt FROM account_transfers WHERE (from_account_id = ? OR to_account_id = ?) AND deleted_at IS NULL',
        [id, id],
      ),
    ]);

    const txnCount = this.first<{cnt: number}>(txnResult)?.cnt ?? 0;
    const recurringCount = this.first<{cnt: number}>(recurringResult)?.cnt ?? 0;
    const transferCount = this.first<{cnt: number}>(transferResult)?.cnt ?? 0;
    return txnCount === 0 && recurringCount === 0 && transferCount === 0;
  }

  async delete(id: number): Promise<void> {
    await this.withTransaction(async () => {
      const account = await this.getById(id);
      if (!account) {
        throw new Error('Account not found.');
      }

      if (account.is_default === 1) {
        throw new Error('The default account cannot be removed.');
      }

      const canDelete = await this.canDelete(id);
      if (!canDelete) {
        throw new Error('This account has history. Move or archive its data before removing it.');
      }

      await this.db.execute('UPDATE accounts SET deleted_at = ?, updated_at = ? WHERE id = ?', [
        this.now(),
        this.now(),
        id,
      ]);
    });
  }

  async transfer(data: CreateTransferData): Promise<void> {
    if (data.from_account_id === data.to_account_id) {
      throw new Error('Choose two different accounts for a transfer.');
    }
    if (!(data.amount > 0)) {
      throw new Error('Transfer amount must be greater than zero.');
    }

    const ts = this.now();
    await this.withTransaction(async () => {
      const [fromAccount, toAccount] = await Promise.all([
        this.getById(data.from_account_id),
        this.getById(data.to_account_id),
      ]);

      if (!fromAccount || !toAccount) {
        throw new Error('Selected account no longer exists.');
      }

      const result = await this.db.execute(
        `INSERT INTO account_transfers
          (from_account_id, to_account_id, amount, note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.from_account_id,
          data.to_account_id,
          data.amount,
          data.note ?? null,
          ts,
          ts,
        ],
      );

      return result.insertId;
    });
  }
}

export const accountRepository = new AccountRepository();
