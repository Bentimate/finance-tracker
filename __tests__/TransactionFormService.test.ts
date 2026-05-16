import {transactionFormService} from '../src/screens/Transactions/services/TransactionFormService';

describe('TransactionFormService', () => {
  test('normalizes expense amount', () => {
    const result = transactionFormService.parseAndNormalizeAmount('-120.50');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({amount: 120.5, type: 'expense'});
    }
  });

  test('normalizes income amount', () => {
    const result = transactionFormService.parseAndNormalizeAmount('+10');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({amount: 10, type: 'income'});
    }
  });

  test('rejects zero amount', () => {
    const result = transactionFormService.parseAndNormalizeAmount('0');
    expect(result.ok).toBe(false);
  });

  test('rejects malformed amount', () => {
    const result = transactionFormService.parseAndNormalizeAmount('abc');
    expect(result.ok).toBe(false);
  });
});
