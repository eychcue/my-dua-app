// File: components/DuaItem.tsx

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Dua } from '@/types/dua';
import { useRouter } from 'expo-router';

type Props = {
  dua: Dua;
  onPress: () => void;
};

export default function DuaItem({ dua, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{dua.title || 'Untitled Dua'}</Text>
        <Text style={styles.preview} numberOfLines={2}>{dua.translation || 'No translation available'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  preview: {
    fontSize: 14,
    color: '#666',
  },
});
