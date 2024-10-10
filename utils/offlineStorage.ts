// utils/offlineStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OfflineRead {
  duaId: string;
  count: number;
}

const OFFLINE_READS_KEY = 'offlineReads';
const OFFLINE_ARCHIVES_KEY = 'offlineArchives';
const OFFLINE_UNARCHIVES_KEY = 'offlineUnarchives';
const OFFLINE_ARCHIVED_DUAS_KEY = 'offlineArchivedDuas'

interface OfflineArchiveAction {
  duaId: string;
  action: 'archive' | 'unarchive';
}

export const getOfflineArchiveActions = async (): Promise<OfflineArchiveAction[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(OFFLINE_ARCHIVES_KEY);
    const archives = jsonValue != null ? JSON.parse(jsonValue) : [];
    const jsonValueUnarchives = await AsyncStorage.getItem(OFFLINE_UNARCHIVES_KEY);
    const unarchives = jsonValueUnarchives != null ? JSON.parse(jsonValueUnarchives) : [];
    return [...archives, ...unarchives];
  } catch (e) {
    console.error('Error reading offline archive actions:', e);
    return [];
  }
};

export const addOfflineArchiveAction = async (duaId: string, action: 'archive' | 'unarchive'): Promise<void> => {
  try {
    const key = action === 'archive' ? OFFLINE_ARCHIVES_KEY : OFFLINE_UNARCHIVES_KEY;
    const existingActions = await AsyncStorage.getItem(key);
    const actions = existingActions ? JSON.parse(existingActions) : [];
    actions.push({ duaId, action });
    await AsyncStorage.setItem(key, JSON.stringify(actions));
  } catch (e) {
    console.error(`Error adding offline ${action} action:`, e);
  }
};

export const clearOfflineArchiveActions = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OFFLINE_ARCHIVES_KEY);
    await AsyncStorage.removeItem(OFFLINE_UNARCHIVES_KEY);
  } catch (e) {
    console.error('Error clearing offline archive actions:', e);
  }
};

export const getOfflineArchivedDuas = async (): Promise<Dua[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(OFFLINE_ARCHIVED_DUAS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading offline archived duas:', e);
    return [];
  }
};

export const setOfflineArchivedDuas = async (duas: Dua[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(OFFLINE_ARCHIVED_DUAS_KEY, JSON.stringify(duas));
  } catch (e) {
    console.error('Error setting offline archived duas:', e);
  }
};


export const getOfflineReads = async (): Promise<OfflineRead[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(OFFLINE_READS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading offline reads:', e);
    return [];
  }
};

export const addOfflineRead = async (duaId: string): Promise<void> => {
  try {
    const offlineReads = await getOfflineReads();
    const existingReadIndex = offlineReads.findIndex(read => read.duaId === duaId);

    if (existingReadIndex !== -1) {
      offlineReads[existingReadIndex].count += 1;
    } else {
      offlineReads.push({ duaId, count: 1 });
    }

    await AsyncStorage.setItem(OFFLINE_READS_KEY, JSON.stringify(offlineReads));
  } catch (e) {
    console.error('Error adding offline read:', e);
  }
};

export const clearOfflineReads = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OFFLINE_READS_KEY);
  } catch (e) {
    console.error('Error clearing offline reads:', e);
  }
};
