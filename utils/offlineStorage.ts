// utils/offlineStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OfflineRead {
  duaId: string;
  count: number;
}

const OFFLINE_READS_KEY = 'offlineReads';

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
