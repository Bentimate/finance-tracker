export interface NormalizedTransactionAmount {
  amount: number;
  type: 'income' | 'expense';
}

export interface ValidationResult {
  ok: boolean;
  message?: string;
}

export interface TransactionUpsertPayload {
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  note?: string;
  date: string;
}

export class TransactionFormService {
  public parseAndNormalizeAmount(rawAmount: string):
    | {ok: true; value: NormalizedTransactionAmount}
    | {ok: false; message: string} {
    const trimmed = rawAmount.trim();
    const hasNegativeSign = trimmed.startsWith('-');
    const hasPositiveSign = trimmed.startsWith('+');
    const numericPart = hasNegativeSign || hasPositiveSign ? trimmed.slice(1) : trimmed;
    const parsed = parseFloat(numericPart);

    if (Number.isNaN(parsed) || parsed === 0) {
      return {ok: false, message: 'Enter a non-zero amount like 120 or -120.'};
    }

    return {
      ok: true,
      value: {
        amount: Math.abs(parsed),
        type: hasNegativeSign ? 'expense' : 'income',
      },
    };
  }

  public validateCategory(categoryId: number | null): ValidationResult {
    if (!categoryId) {
      return {ok: false, message: 'Please select a category.'};
    }
    return {ok: true};
  }

  public buildPayload(input: {
    normalizedAmount: NormalizedTransactionAmount;
    categoryId: number;
    note: string;
    date: string;
  }): TransactionUpsertPayload {
    return {
      amount: input.normalizedAmount.amount,
      type: input.normalizedAmount.type,
      category_id: input.categoryId,
      note: input.note.trim() || undefined,
      date: input.date,
    };
  }
}

export const transactionFormService = new TransactionFormService();
