// File: app/dua/[id].tsx

import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDua } from '@/contexts/DuaContext';
import DuaDetails from '@/components/DuaDetails';

export default function DuaModalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { duas, fetchDuas } = useDua();
  const router = useRouter();

  useEffect(() => {
    if (!duas.length) {
      fetchDuas();
    }
  }, []);

  const dua = duas.find(d => d._id === id);

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
