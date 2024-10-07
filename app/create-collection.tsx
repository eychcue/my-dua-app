// File: app/create-sequence.tsx

import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, FlatList, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useDua } from '@/contexts/DuaContext';
import { useRouter } from 'expo-router';
import { Dua } from '@/types/dua';  // Ensure this path is correct

export default function CreateCollectionScreen() {
  const [collectionName, setCollectionName] = useState('');
  const [selectedDuas, setSelectedDuas] = useState<string[]>([]);
  const { duas, addCollection } = useDua();
  const router = useRouter();

  const handleCreateCollection = async () => {
    if (collectionName && selectedDuas.length > 0) {
      await addCollection({
        name: collectionName,
        duaIds: selectedDuas,
      });
      router.back();
    }
  };

  const toggleDuaSelection = (duaId: string) => {
    setSelectedDuas(prev => {
      if (prev.includes(duaId)) {
        return prev.filter(id => id !== duaId);
      } else {
        return [...prev, duaId];
      }
    });
  };

  const getSelectionOrder = (duaId: string) => {
    const index = selectedDuas.indexOf(duaId);
    return index !== -1 ? index + 1 : null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Collection</Text>
      <TextInput
        style={styles.input}
        onChangeText={setCollectionName}
        value={collectionName}
        placeholder="Enter collection name"
      />
      <Text style={styles.subtitle}>Select Duas:</Text>
      <FlatList
        data={duas}
        renderItem={({ item }: { item: Dua }) => (
          <TouchableOpacity
            style={[
              styles.duaItem,
              selectedDuas.includes(item._id) && styles.selectedDuaItem
            ]}
            onPress={() => toggleDuaSelection(item._id)}
          >
            <Text style={styles.duaTitle}>{item.title}</Text>
            {getSelectionOrder(item._id) && (
              <RNView style={styles.orderIndicator}>
                <Text style={styles.orderText}>{getSelectionOrder(item._id)}</Text>
              </RNView>
            )}
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={[
          styles.createButton,
          (!collectionName || selectedDuas.length === 0) && styles.disabledButton
        ]}
        onPress={handleCreateCollection}
        disabled={!collectionName || selectedDuas.length === 0}
      >
        <Text style={styles.createButtonText}>Create Collection</Text>
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
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  duaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedDuaItem: {
    backgroundColor: 'lightblue',
  },
  duaTitle: {
    fontSize: 16,
    flex: 1,
  },
  orderIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    color: 'white',
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
