// File: api.js

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { BackendDua, Collection } from './types/dua';
import NetInfo from '@react-native-community/netinfo';
import { getOfflineReads, clearOfflineReads } from './utils/offlineStorage';

const BASE_URL = 'https://9b0c-69-140-179-172.ngrok-free.app'; // Verify this URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getOrCreateUserId = async () => {
  try {
    // Try to retrieve the device ID from secure storage
    let deviceId = await SecureStore.getItemAsync('deviceId');

    if (deviceId) {
      console.log('Retrieved existing deviceId:', deviceId);
      return deviceId;
    } else {
      console.log('No existing deviceId found, creating new one');
      // If the device ID doesn't exist, create a new one
      deviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log('Sending request to create new user with deviceId:', deviceId);
      // Create a new user in the backend
      const response = await api.post('/users', { device_id: deviceId });

      console.log('Received response from backend:', response.data);

      if (response.data && response.data._id) {
        console.log('User created successfully, storing deviceId');
        // If the user was successfully created in the backend, store the device ID in secure storage
        await SecureStore.setItemAsync('deviceId', deviceId);
        return deviceId;
      } else {
        console.error('Unexpected response from backend:', response.data);
        throw new Error('Unexpected response from backend');
      }
    }
  } catch (error) {
    console.error('Error in getOrCreateUserId:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
    }
    throw error;
  }
};

// GET /duas
export const getDuas = async () => {
  try {
    const response = await api.get('/duas');
    return response.data;
  } catch (error) {
    console.error('Error fetching duas:', error);
    throw error;
  }
};

// POST /duas
export const createDua = async (description) => {
  try {
    console.log('Sending request to create dua with description:', description);
    console.log('Full URL:', `${BASE_URL}/duas`);

    const response = await fetch(`${BASE_URL}/duas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response data:', data);

    if (!data || !data._id) {
      throw new Error('Invalid response data');
    }

    return data;
  } catch (error) {
    console.error('Error creating dua:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};


// GET /duas/{dua_id}
export const getDua = async (duaId) => {
  try {
    const response = await api.get(`/duas/${duaId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dua:', error);
    throw error;
  }
};

// POST /users
export const createUser = async (deviceId) => {
  try {
    const response = await api.post('/users', { device_id: deviceId });
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// GET /users/{device_id}
export const getUser = async (deviceId) => {
  try {
    const response = await api.get(`/users/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// PUT /users/{device_id}/read_count
export const updateReadCount = async (duaId: string): Promise<number> => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    const response = await api.put(`/users/${deviceId}/read_count`, { dua_id: duaId });
    return response.data.updated_read_count;
  } catch (error) {
    console.error('Error updating read count:', error);
    throw error;
  }
};

export const removeDuaFromUser = async (duaId: string): Promise<void> => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    await api.delete(`/users/${deviceId}/duas/${duaId}`);
  } catch (error) {
    console.error('Error removing dua from user:', error);
    throw error;
  }
};

// POST /users/{device_id}/duas/{dua_id}
export const addDuaToUser = async (duaId) => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    const response = await api.post(`/users/${deviceId}/duas/${duaId}`);
    console.log('Dua added to user:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding dua to user:', error);
    throw error;
  }
};

// GET /users/{device_id}/duas
export const getUserDuas = async () => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    const response = await api.get(`/users/${deviceId}/duas`);
    console.log('Fetched user duas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user duas:', error);
    throw error;
  }
};

// GET /users/{device_id}/duas/{dua_id}/read_count
export const getDuaReadCount = async (duaId) => {
  try {
    const userId = await getOrCreateUserId();
    const response = await api.get(`/users/${userId}/duas/${duaId}/read_count`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dua read count:', error);
    throw error;
  }
};

// New function to create a collection
export const createCollection = async (collection: {
  name: string;
  duaIds: string[];
  scheduled_time: string | null;
  notification_enabled: boolean
}): Promise<Collection> => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    const response = await api.post(`/users/${deviceId}/collections`, collection);
    return response.data;
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
};

// New function to get user collections
export const getUserCollections = async (): Promise<Collection[]> => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    const response = await api.get(`/users/${deviceId}/collections`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user collections:', error);
    throw error;
  }
};

export const deleteUserCollection = async (collectionId: string): Promise<void> => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    await api.delete(`/users/${deviceId}/collections/${collectionId}`);
  } catch (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }
};

export const updateUserCollection = async (collection: Collection): Promise<void> => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    await api.put(`/users/${deviceId}/collections/${collection._id}`, collection);
  } catch (error) {
    console.error('Error updating collection:', error);
    throw error;
  }
};

export const markDuaAsRead = async (duaId: string): Promise<number> => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    const response = await api.put(`/users/${deviceId}/duas/${duaId}/read`);
    return response.data.read_count;
  } catch (error) {
    console.error('Error marking dua as read:', error);
    throw error; // Rethrow the error to be caught in the context
  }
};

export const batchMarkDuasAsRead = async (duaIds: string[]): Promise<{ [key: string]: number }> => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    const response = await api.put(`/users/${deviceId}/duas/batch_read`, { dua_ids: duaIds });
    return response.data.updated_counts;
  } catch (error) {
    console.error('Error batch marking duas as read:', error);
    throw error;
  }
};

export const batchUpdateReadCount = async (updates: Record<string, number>): Promise<Record<string, number>> => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    const response = await api.put(`/users/${deviceId}/duas/batch_update_read_count`, updates);
    return response.data.updated_counts;
  } catch (error) {
    console.error('Error batch updating read counts:', error);
    throw error;
  }
};

export const getReadCounts = async (): Promise<{ [key: string]: number }> => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    const response = await api.get(`/users/${deviceId}/read_counts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching read counts:', error);
    throw error;
  }
};

export const syncOfflineReads = async () => {
  const netInfo = await NetInfo.fetch();
  if (netInfo.isConnected) {
    try {
      const offlineReads = await getOfflineReads();
      if (offlineReads.length > 0) {
        const duaIds = offlineReads.flatMap(read => Array(read.count).fill(read.duaId));
        await batchMarkDuasAsRead(duaIds);
        await clearOfflineReads();
      }
    } catch (error) {
      console.error('Error syncing offline reads:', error);
    }
  }
};

export const archiveDua = async (duaId) => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    await api.post(`/users/${deviceId}/duas/${duaId}/archive`);
  } catch (error) {
    console.error('Error archiving dua:', error);
    throw error;
  }
};

export const unarchiveDua = async (duaId) => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    await api.post(`/users/${deviceId}/duas/${duaId}/unarchive`);
  } catch (error) {
    console.error('Error unarchiving dua:', error);
    throw error;
  }
};

export const getUserArchivedDuas = async () => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    const response = await api.get(`/users/${deviceId}/archived_duas`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user archived duas:', error);
    throw error;
  }
};

export const batchUpdateArchiveStatus = async (actions) => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    const response = await api.put(`/users/${deviceId}/duas/batch_archive_update`, { actions });
    return response.data;
  } catch (error) {
    console.error('Error batch updating archive status:', error);
    throw error;
  }
};

export const batchUpdateDeletionStatus = async (actions) => {
  try {
    const deviceId = await SecureStore.getItemAsync('deviceId');
    if (!deviceId) {
      throw new Error('Device ID not found');
    }
    const response = await api.put(`/users/${deviceId}/duas/batch_deletion_update`, { actions });
    return response.data;
  } catch (error) {
    console.error('Error batch updating deletion status:', error);
    throw error;
  }
};

export const batchUpdateCollections = async (actions) => {
  try {
    const deviceId = await getOrCreateUserId();
    console.log('Sending batch update request:', { deviceId, actions });
    const response = await axios.put(`${BASE_URL}/users/${deviceId}/collections/batch_update`, { actions });
    console.log('Batch update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in batchUpdateCollections:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

export default api;
