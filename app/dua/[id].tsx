// File: app/dua/[id].tsx

import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useDua } from '@/contexts/DuaContext';
import DuaDetails from '@/components/DuaDetails';

export default function DuaModalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { duas, fetchDuas, fetchDua } = useDua();
  const router = useRouter();

  const fetchDuaData = useCallback(async () => {
    if (!duas.length) {
      console.log('Fetching all duas');
      await fetchDuas();
    }

    if (id && !duas.find(d => d._id === id)) {
      console.log('Fetching specific dua with id:', id);
      await fetchDua(id);
    }
  }, [id, duas, fetchDuas, fetchDua]);

  useEffect(() => {
    console.log('DuaModalScreen mounted with id:', id);
    fetchDuaData();
  }, [fetchDuaData]);

  const dua = duas.find(d => d._id === id);

  console.log('Found dua:', dua);

  if (!dua) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <DuaDetails dua={dua} onClose={handleClose} />
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
