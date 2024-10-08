// File: app/dua/[id].tsx

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDua } from '@/contexts/DuaContext';
import DuaDetails from '@/components/DuaDetails';

export default function DuaModalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { duas } = useDua();
  const router = useRouter();

  const dua = duas.find(d => d._id === id);

  if (!dua) {
    return null;
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
});
