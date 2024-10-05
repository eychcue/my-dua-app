// File: api.js

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { BackendDua } from './types/dua';  // Adjust this import path as needed

const BASE_URL = 'https://3a59-69-140-179-172.ngrok-free.app'; // Verify this URL

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
export const updateReadCount = async (duaId) => {
  try {
    const userId = await getOrCreateUserId();
    const response = await api.put(`/users/${userId}/read_count`, { dua_id: duaId });
    return response.data;
  } catch (error) {
    console.error('Error updating read count:', error);
    throw error;
  }
};

// GET /users/{device_id}/read_counts
export const getReadCounts = async () => {
  try {
    const userId = await getOrCreateUserId();
    const response = await api.get(`/users/${userId}/read_counts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching read counts:', error);
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
    const userId = await getOrCreateUserId();
    const response = await api.get(`/users/${userId}/duas`);
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

export default api;
