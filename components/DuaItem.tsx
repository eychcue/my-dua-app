// File: components/DuaItem.tsx

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Dua } from '@/types/dua';
import { useRouter } from 'expo-router';

type Props = {
  dua: Dua;
};

export default function DuaItem({ dua }: Props) {
  const router = useRouter();

  const handlePress = () => {
    if (dua._id) {
      router.push(`/dua/${dua._id}`);
    } else {
      console.warn('Dua _id is missing');
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
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
