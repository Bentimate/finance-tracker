import {CreateRecurringTransactionData, RecurringTransaction} from '../types';
import {BaseRepository} from './BaseRepository';
import {recurrenceDateService} from './services/RecurrenceDateService';

const SELECT_WITH_CATEGORY = `
  SELECT r.*,
         c.name  AS category_name,
         c.color AS category_color,
         c.icon  AS category_icon,
         p.name  AS category_parent_name
  FROM   recurring_transactions r
  JOIN   categories c ON c.id = r.category_id
  LEFT JOIN categories p ON p.id = c.parent_id
`;

function buildAccountWhere(accountId?: number): {sql: string; params: number[]} {
  if (!accountId) {
    return {sql: '', params: []};
  }
  return {sql: ' AND account_id = ?', params: [accountId]};
}

class RecurringTransactionRepository extends BaseRepository {
  async getAll(includeInactive = false, accountId?: number): Promise<RecurringTransaction[]> {
    const accountFilter = buildAccountWhere(accountId);
    const result = await this.db.execute(
      `${SELECT_WITH_CATEGORY}
       WHERE r.deleted_at IS NULL
         ${includeInactive ? '' : 'AND r.is_active = 1'}
         ${accountFilter.sql}
       ORDER BY r.next_occurrence ASC, r.created_at DESC`,
      accountFilter.params,
    );
    return this.rows<RecurringTransaction>(result);
  }

  async getById(id: number): Promise<RecurringTransaction | null> {
    const result = await this.db.execute(
      `${SELECT_WITH_CATEGORY}
       WHERE r.id = ?
         AND r.deleted_at IS NULL`,
      [id],
    );
    return this.first<RecurringTransaction>(result);
  }

  async create(data: CreateRecurringTransactionData): Promise<number | undefined> {
    const ts = this.now();
    const payload = this.normalizePayload(data, new Date(ts));

    return this.withTransaction(async () => {
      const result = await this.db.execute(
        `INSERT INTO recurring_transactions
          (amount, type, account_id, category_id, note, frequency, interval_value, next_occurrence, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payload.amount,
          payload.type,
          payload.account_id,
          payload.category_id,
          payload.note ?? null,
          payload.frequency,
          payload.interval_value ?? null,
          payload.next_occurrence,
          ts,
          ts,
        ],
      );
      return result.insertId;
    });
  }

  async update(id: number, data: CreateRecurringTransactionData): Promise<void> {
    const ts = this.now();
    const payload = this.normalizePayload(data, new Date(ts));

    await this.withTransaction(async () => {
      await this.db.execute(
        `UPDATE recurring_transactions
         SET amount = ?,
             type = ?,
             account_id = ?,
             category_id = ?,
             note = ?,
             frequency = ?,
             interval_value = ?,
             next_occurrence = ?,
             updated_at = ?
         WHERE id = ?
           AND deleted_at IS NULL`,
        [
          payload.amount,
          payload.type,
          payload.account_id,
          payload.category_id,
          payload.note ?? null,
          payload.frequency,
          payload.interval_value ?? null,
          payload.next_occurrence,
          ts,
          id,
        ],
      );
    });
  }

  async delete(id: number): Promise<void> {
    await this.db.execute(
      `UPDATE recurring_transactions
       SET deleted_at = ?, is_active = 0, updated_at = ?
       WHERE id = ?`,
      [this.now(), this.now(), id],
    );
  }

  async generateDueTransactions(now = new Date()): Promise<number> {
    const nowIso = now.toISOString();
    const due = await this.getDue(nowIso);
    let generatedCount = 0;

    for (const template of due) {
      generatedCount += await this.generateForTemplate(template, now);
    }

    return generatedCount;
  }

  private async getDue(nowIso: string): Promise<RecurringTransaction[]> {
    const result = await this.db.execute(
      `${SELECT_WITH_CATEGORY}
       WHERE r.deleted_at IS NULL
         AND r.is_active = 1
         AND r.next_occurrence <= ?
       ORDER BY r.next_occurrence ASC`,
      [nowIso],
    );
    return this.rows<RecurringTransaction>(result);
  }

  private async generateForTemplate(template: RecurringTransaction, now: Date): Promise<number> {
    return this.withTransaction(async () => {
      let generatedCount = 0;
      let occurrence = recurrenceDateService.normalizeNextOccurrence({
        frequency: template.frequency,
        intervalValue: template.interval_value,
        nextOccurrence: template.next_occurrence,
        now: new Date(template.next_occurrence),
      });

      while (new Date(occurrence) <= now) {
        const ts = this.now();
        const result = await this.db.execute(
        `INSERT OR IGNORE INTO transactions
            (amount, type, account_id, category_id, date, note, recurring_transaction_id, recurring_occurrence_date, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            template.amount,
            template.type,
            template.account_id,
            template.category_id,
            occurrence,
            template.note ?? null,
            template.id,
            occurrence,
            ts,
            ts,
          ],
        );

        if ((result.rowsAffected ?? 0) > 0) {
          generatedCount += 1;
        }

        occurrence = recurrenceDateService.advanceAfterOccurrence({
          frequency: template.frequency,
          intervalValue: template.interval_value,
          occurrence,
        });
      }

      await this.db.execute(
        `UPDATE recurring_transactions
         SET next_occurrence = ?, updated_at = ?
         WHERE id = ?`,
        [occurrence, this.now(), template.id],
      );

      return generatedCount;
    });
  }

  private normalizePayload(
    data: CreateRecurringTransactionData,
    now: Date,
  ): CreateRecurringTransactionData {
    const intervalValue = data.interval_value
      ?? recurrenceDateService.defaultIntervalValue(data.frequency, new Date(data.next_occurrence));

    if (!recurrenceDateService.validateIntervalValue(data.frequency, intervalValue)) {
      throw new Error('Invalid recurrence frequency details.');
    }

    return {
      ...data,
      note: data.note?.trim() || undefined,
      interval_value: data.frequency === 'daily' ? null : intervalValue,
      next_occurrence: recurrenceDateService.normalizeNextOccurrence({
        frequency: data.frequency,
        intervalValue: data.frequency === 'daily' ? null : intervalValue,
        nextOccurrence: data.next_occurrence,
        now,
      }),
    };
  }
}

export const recurringTransactionRepository = new RecurringTransactionRepository();
