// File: app/dua/[id].tsx

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useDua } from '@/contexts/DuaContext';
import DuaDetails from '@/components/DuaDetails';
import api from '@/api';
import { Dua } from '@/types/dua';

export default function DuaModalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { duas, fetchDuas } = useDua();
  const router = useRouter();
  const [viewedDua, setViewedDua] = useState<Dua | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if this dua exists in the user's duas list
  const isUserDua = useMemo(() => duas.some(dua => dua._id === id), [duas, id]);

  // Separate function to fetch a dua without adding it to global state
  const fetchSingleDua = async (duaId: string) => {
    try {
      const response = await api.get(`/duas/${duaId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching single dua:', error);
      return null;
    }
  };

  const fetchDuaData = useCallback(async () => {
    try {
      setIsLoading(true);

      // First, ensure we have the user's duas
      if (!duas.length) {
        await fetchDuas();
      }

      // Check if the dua exists in user's duas
      const userDua = duas.find(d => d._id === id);

      if (userDua) {
        setViewedDua(userDua);
      } else {
        const fetchedDua = await fetchSingleDua(id);
        if (fetchedDua) {
          setViewedDua(fetchedDua);
        }
      }
    } catch (error) {
      console.error('Error in fetchDuaData:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, duas, fetchDuas]);

  useEffect(() => {
    fetchDuaData();
  }, [fetchDuaData]);

  const handleClose = () => {
    router.back();
  };

  if (isLoading || !viewedDua) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <DuaDetails
        dua={viewedDua}
        onClose={handleClose}
        isUserDua={isUserDua}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
