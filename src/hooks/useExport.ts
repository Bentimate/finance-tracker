import {useState, useCallback} from 'react';
import {transactionRepository} from '../repositories/transactionRepository';
import {exportRepository} from '../repositories/exportRepository';
import {csvExporter, ExportResult} from '../utils/exportCsv';

export type ExportStatus =
  | {kind: 'idle'}
  | {kind: 'loading'}
  | {kind: 'success'; result: ExportResult}
  | {kind: 'error'; message: string};

/**
 * Manages the export lifecycle for a given year/month.
 * Fetches both data sets, writes CSV files, and exposes status to the UI.
 */
export function useExport() {
  const [status, setStatus] = useState<ExportStatus>({kind: 'idle'});

  const runExport = useCallback(async (year: number, month: number) => {
    setStatus({kind: 'loading'});
    try {
      const [transactions, categories] = await Promise.all([
        transactionRepository.getForExport(year, month),
        exportRepository.getCategoriesForExport(),
      ]);

      const result = await csvExporter.export(transactions, categories, year, month);
      setStatus({kind: 'success', result});
    } catch (e: any) {
      setStatus({
        kind: 'error',
        message: e?.message ?? 'Export failed. Please try again.',
      });
    }
  }, []);

  const reset = useCallback(() => setStatus({kind: 'idle'}), []);

  return {status, runExport, reset};
}
