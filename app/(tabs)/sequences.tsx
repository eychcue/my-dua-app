// File: app/(tabs)/sequences.tsx

import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useDua } from '@/contexts/DuaContext';
import { useRouter } from 'expo-router';

export default function SequencesScreen() {
  const { sequences } = useDua();
  const router = useRouter();

  const handleSequencePress = (sequenceId: string) => {
    router.push(`/sequence/${sequenceId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Sequences</Text>
      <FlatList
        data={sequences}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.sequenceItem}
            onPress={() => handleSequencePress(item.id)}
          >
            <Text style={styles.sequenceName}>{item.name}</Text>
            <Text style={styles.sequenceCount}>{item.duaIds.length} duas</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/create-sequence')}
      >
        <Text style={styles.createButtonText}>Create New Sequence</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  sequenceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sequenceName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sequenceCount: {
    fontSize: 14,
    color: '#666',
  },
  createButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
