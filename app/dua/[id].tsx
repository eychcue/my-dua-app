// File: app/dua/[id].tsx

import React from 'react';
import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useDua } from '@/contexts/DuaContext';
import DuaDetails from '@/components/DuaDetails';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DuaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { duas } = useDua();

  const dua = duas.find(d => d.id === id);

  if (!dua) {
    return null; // or you could return a "Dua not found" message
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DuaDetails dua={dua} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
