import RNFS from 'react-native-fs';
import {Platform} from 'react-native';
import {database} from '../database/db';
import {pick, isCancel, types} from '@react-native-documents/picker';

const DB_NAME = 'finance_tracker.db';

class BackupService {
  /**
   * Backs up the current database by copying it to the Downloads folder (Android)
   * or Documents folder (iOS) with the current date appended to the filename.
   */
  public async backup(): Promise<string> {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T');
    const datePart = timestamp[0];
    const timePart = timestamp[1].substring(0, 8); // hh-mm-ss
    const backupFileName = `finance_tracker_backup_${datePart}_${timePart}.db`;

    const sourcePath = await this.getDatabasePath();
    const destinationPath = this.getBackupDestinationPath(backupFileName);

    const exists = await RNFS.exists(sourcePath);
    if (!exists) {
      // Fallback: try to find it in files/ if databases/ failed (common in some RN configs)
      const fallbackPath = `${RNFS.DocumentDirectoryPath}/${DB_NAME}`;
      const fallbackExists = await RNFS.exists(fallbackPath);
      if (!fallbackExists) {
        throw new Error('Database file not found. Could not perform backup.');
      }
      return this.performCopy(fallbackPath, destinationPath);
    }

    return this.performCopy(sourcePath, destinationPath);
  }

  /**
   * Prompts the user to select a .db file and restores it as the current database.
   */
  public async restore(): Promise<void> {
    try {
      const result = await pick({
        type: [types.allFiles], // Ideally we'd filter by .db but android mime types are tricky
      });

      const pickedFile = result[0];
      if (!pickedFile || !pickedFile.uri) {
        return;
      }

      // Close DB connection before swapping files
      await database.close();

      const targetPath = await this.getDatabasePath();

      // On Android/iOS, we copy from the picked URI to a temp file first
      const tempPath = `${RNFS.CachesDirectoryPath}/restore_temp.db`;

      if (await RNFS.exists(tempPath)) {
        await RNFS.unlink(tempPath);
      }

      // Use copyFile for both platforms. RNFS handles content:// on Android.
      await RNFS.copyFile(pickedFile.uri, tempPath);

      // Ensure the directory exists
      const dirPath = targetPath.substring(0, targetPath.lastIndexOf('/'));
      const dirExists = await RNFS.exists(dirPath);
      if (!dirExists) {
        await RNFS.mkdir(dirPath);
      }

      // Replace the current DB file and purge any existing journal/WAL files
      // to prevent "readonly" or "disk image is malformed" errors due to stale auxiliary files.
      const auxiliaryFiles = [
        targetPath,
        `${targetPath}-journal`,
        `${targetPath}-wal`,
        `${targetPath}-shm`,
      ];

      for (const file of auxiliaryFiles) {
        if (await RNFS.exists(file)) {
          await RNFS.unlink(file);
        }
      }

      // Copy the backup to the final destination
      // Using copyFile instead of moveFile helps ensure the app is the owner with write permissions
      await RNFS.copyFile(tempPath, targetPath);
      await RNFS.unlink(tempPath);

      // Re-initialize the database
      await database.init();
    } catch (err) {
      if (isCancel(err)) {
        // User cancelled the picker
        return;
      }
      throw err;
    }
  }

  private async performCopy(source: string, destination: string): Promise<string> {
    try {
      // If destination already exists, unlink it first to avoid copy errors
      if (await RNFS.exists(destination)) {
        await RNFS.unlink(destination);
      }
      await RNFS.copyFile(source, destination);
      return destination;
    } catch (error) {
      console.error('Backup copy failed:', error);
      throw error;
    }
  }

  private async getDatabasePath(): Promise<string> {
    if (Platform.OS === 'android') {
      // Standard location for op-sqlite on Android: /data/data/com.finance_tracker_rn/databases/
      // RNFS.DocumentDirectoryPath is usually /data/data/com.finance_tracker_rn/files
      return `${RNFS.DocumentDirectoryPath}/../databases/${DB_NAME}`;
    } else {
      // Standard location for op-sqlite on iOS: Library/Application Support/ or Library/LocalDatabase/
      const path1 = `${RNFS.LibraryDirectoryPath}/LocalDatabase/${DB_NAME}`;
      const path2 = `${RNFS.DocumentDirectoryPath}/${DB_NAME}`;

      if (await RNFS.exists(path1)) return path1;
      return path2;
    }
  }

  private getBackupDestinationPath(fileName: string): string {
    if (Platform.OS === 'android') {
      return `${RNFS.DownloadDirectoryPath}/${fileName}`;
    } else {
      return `${RNFS.DocumentDirectoryPath}/${fileName}`;
    }
  }
}

export const backupService = new BackupService();
