// utils/offlineStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dua, Collection } from '@/types/dua';

const OFFLINE_READS_KEY = 'offlineReads';
const OFFLINE_ARCHIVES_KEY = 'offlineArchives';
const OFFLINE_UNARCHIVES_KEY = 'offlineUnarchives';
const OFFLINE_ARCHIVED_DUAS_KEY = 'offlineArchivedDuas'
const OFFLINE_DELETED_DUAS_KEY = 'offlineDeletedDuas';
const OFFLINE_DELETION_ACTIONS_KEY = 'offlineDeletionActions';
const OFFLINE_DUAS_KEY = 'offlineDuas';
const OFFLINE_DEVICE_ID_KEY = 'offlineDeviceId';
const PENDING_USER_CREATION_KEY = 'pendingUserCreation';

interface PendingUserCreation {
  deviceId: string;
  timestamp: number;
}

interface OfflineRead {
  duaId: string;
  count: number;
}

interface OfflineArchiveAction {
  duaId: string;
  action: 'archive' | 'unarchive';
}

interface DeletionAction {
  duaId: string;
  action: 'delete' | 'undoDelete';
}

const OFFLINE_COLLECTIONS_KEY = 'offlineCollections';
const OFFLINE_COLLECTION_ACTIONS_KEY = 'offlineCollectionActions';

export const getOfflineDeviceId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(OFFLINE_DEVICE_ID_KEY);
  } catch (e) {
    console.error('Error getting offline device ID:', e);
    return null;
  }
};

export const setOfflineDeviceId = async (deviceId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(OFFLINE_DEVICE_ID_KEY, deviceId);
  } catch (e) {
    console.error('Error setting offline device ID:', e);
  }
};

export const getPendingUserCreation = async (): Promise<PendingUserCreation | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PENDING_USER_CREATION_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error getting pending user creation:', e);
    return null;
  }
};

export const setPendingUserCreation = async (pendingUser: PendingUserCreation): Promise<void> => {
  try {
    await AsyncStorage.setItem(PENDING_USER_CREATION_KEY, JSON.stringify(pendingUser));
  } catch (e) {
    console.error('Error setting pending user creation:', e);
  }
};

export const clearPendingUserCreation = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PENDING_USER_CREATION_KEY);
  } catch (e) {
    console.error('Error clearing pending user creation:', e);
  }
};

export interface CollectionAction {
  type: 'create' | 'update' | 'delete';
  collection: Collection;
  timestamp: number;
}

export const getOfflineCollections = async (): Promise<Collection[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(OFFLINE_COLLECTIONS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading offline collections:', e);
    return [];
  }
};

export const setOfflineCollections = async (collections: Collection[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(collections);
    await AsyncStorage.setItem(OFFLINE_COLLECTIONS_KEY, jsonValue);
  } catch (e) {
    console.error('Error setting offline collections:', e);
  }
};

interface CollectionAction {
  type: 'add' | 'update' | 'delete';
  collection: Collection;
}

export const addOfflineCollectionAction = async (action: CollectionAction): Promise<void> => {
  try {
    const existingActions = await getOfflineCollectionActions();
    let updatedActions;
    if (action.type === 'delete') {
      // For delete actions, remove all previous actions for this collection
      updatedActions = existingActions.filter(a => a.collection._id !== action.collection._id);
    } else {
      // For create or update actions, keep previous actions
      updatedActions = existingActions;
    }
    updatedActions.push({ ...action, timestamp: Date.now() });
    await AsyncStorage.setItem(OFFLINE_COLLECTION_ACTIONS_KEY, JSON.stringify(updatedActions));
  } catch (e) {
    console.error('Error adding offline collection action:', e);
  }
};

export const getOfflineCollectionActions = async (): Promise<CollectionAction[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(OFFLINE_COLLECTION_ACTIONS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading offline collection actions:', e);
    return [];
  }
};

export const clearOfflineCollectionActions = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OFFLINE_COLLECTION_ACTIONS_KEY);
  } catch (e) {
    console.error('Error clearing offline collection actions:', e);
  }
};


export const getOfflineDuas = async (): Promise<Dua[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(OFFLINE_DUAS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading offline duas:', e);
    return [];
  }
};

export const setOfflineDuas = async (duas: Dua[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(OFFLINE_DUAS_KEY, JSON.stringify(duas));
  } catch (e) {
    console.error('Error setting offline duas:', e);
  }
};

export const getOfflineDeletedDuas = async (): Promise<Dua[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(OFFLINE_DELETED_DUAS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading offline deleted duas:', e);
    return [];
  }
};

export const setOfflineDeletedDuas = async (duas: Dua[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(OFFLINE_DELETED_DUAS_KEY, JSON.stringify(duas));
  } catch (e) {
    console.error('Error setting offline deleted duas:', e);
  }
};

export const addOfflineDeletionAction = async (action: DeletionAction): Promise<void> => {
  try {
    const existingActions = await AsyncStorage.getItem(OFFLINE_DELETION_ACTIONS_KEY);
    const actions = existingActions ? JSON.parse(existingActions) : [];
    actions.push(action);
    await AsyncStorage.setItem(OFFLINE_DELETION_ACTIONS_KEY, JSON.stringify(actions));
  } catch (e) {
    console.error('Error adding offline deletion action:', e);
  }
};

export const getOfflineDeletionActions = async (): Promise<DeletionAction[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(OFFLINE_DELETION_ACTIONS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading offline deletion actions:', e);
    return [];
  }
};

export const clearOfflineDeletionActions = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OFFLINE_DELETION_ACTIONS_KEY);
  } catch (e) {
    console.error('Error clearing offline deletion actions:', e);
  }
};

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
