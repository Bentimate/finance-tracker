import {useState, useCallback} from 'react';
import {Alert} from 'react-native';
import RNRestart from 'react-native-restart';
import {backupService} from '../utils/backupService';

export type BackupStatus =
  | {kind: 'idle'}
  | {kind: 'loading'}
  | {kind: 'success'; path: string}
  | {kind: 'error'; message: string};

export function useBackup() {
  const [status, setStatus] = useState<BackupStatus>({kind: 'idle'});

  const runBackup = useCallback(async () => {
    setStatus({kind: 'loading'});
    try {
      const path = await backupService.backup();
      setStatus({kind: 'success', path});
    } catch (e: any) {
      setStatus({
        kind: 'error',
        message: e?.message ?? 'Backup failed. Please try again.',
      });
    }
  }, []);

  const runRestore = useCallback(async () => {
    setStatus({kind: 'loading'});
    try {
      await backupService.restore();
      setStatus({kind: 'idle'});

      Alert.alert(
        'Restore Successful',
        'Database has been restored. The app will now restart to apply changes.',
        [
          {
            text: 'OK',
            onPress: () => {
              RNRestart.Restart();
            },
          },
        ],
        {cancelable: false},
      );
    } catch (e: any) {
      setStatus({
        kind: 'error',
        message: e?.message ?? 'Restore failed. Please try again.',
      });
    }
  }, []);

  const reset = useCallback(() => setStatus({kind: 'idle'}), []);

  return {status, runBackup, runRestore, reset};
}
