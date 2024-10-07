// File: app/edit-sequence.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, FlatList, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useDua } from '@/contexts/DuaContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

export default function EditSequenceScreen() {
  const { sequenceId } = useLocalSearchParams<{ sequenceId: string }>();
  const { sequences, updateSequence, duas } = useDua();
  const router = useRouter();

  const [sequence, setSequence] = useState(sequences.find(seq => seq._id === sequenceId));
  const [sequenceName, setSequenceName] = useState(sequence?.name || '');
  const [sequenceDuas, setSequenceDuas] = useState<Array<{ id: string; title: string; order: number }>>([]);
  const [availableDuas, setAvailableDuas] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    if (sequence && duas.length > 0) {
      const orderedDuas = sequence.duaIds.map((duaId, index) => {
        const dua = duas.find(d => d._id === duaId);
        return { id: duaId, title: dua?.title || 'Unknown Dua', order: index + 1 };
      });
      setSequenceDuas(orderedDuas);

      const availableDuasList = duas
        .filter(dua => !sequence.duaIds.includes(dua._id))
        .map(dua => ({ id: dua._id, title: dua.title }));
      setAvailableDuas(availableDuasList);
    }
  }, [sequence, duas]);

  const handleSave = async () => {
    if (sequence) {
      const updatedSequence = {
        ...sequence,
        name: sequenceName,
        duaIds: sequenceDuas.map(dua => dua.id)
      };
      await updateSequence(updatedSequence);
      router.back();
    }
  };

  const renderSequenceDuaItem = ({ item, drag, isActive }: RenderItemParams<{ id: string; title: string; order: number }>) => (
    <TouchableOpacity
      style={[styles.duaItem, isActive && styles.activeItem]}
      onLongPress={drag}
    >
      <Text style={styles.orderNumber}>{item.order}</Text>
      <Text style={styles.duaTitle}>{item.title}</Text>
      <TouchableOpacity onPress={() => removeDuaFromSequence(item.id)}>
        <Ionicons name="remove-circle-outline" size={24} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAvailableDuaItem = ({ item }: { item: { id: string; title: string } }) => (
    <TouchableOpacity
      style={styles.availableDuaItem}
      onPress={() => addDuaToSequence(item.id)}
    >
      <Text style={styles.duaTitle}>{item.title}</Text>
      <Ionicons name="add-circle-outline" size={24} color="green" />
    </TouchableOpacity>
  );

  const addDuaToSequence = (duaId: string) => {
    const duaToAdd = availableDuas.find(dua => dua.id === duaId);
    if (duaToAdd) {
      setSequenceDuas(prev => [...prev, { ...duaToAdd, order: prev.length + 1 }]);
      setAvailableDuas(prev => prev.filter(dua => dua.id !== duaId));
    }
  };

  const removeDuaFromSequence = (duaId: string) => {
    const duaToRemove = sequenceDuas.find(dua => dua.id === duaId);
    if (duaToRemove) {
      setSequenceDuas(prev => prev.filter(dua => dua.id !== duaId));
      setAvailableDuas(prev => [...prev, { id: duaId, title: duaToRemove.title }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Sequence</Text>
      <TextInput
        style={styles.input}
        value={sequenceName}
        onChangeText={setSequenceName}
        placeholder="Sequence Name"
      />
      <Text style={styles.sectionTitle}>Duas in Sequence</Text>
      <DraggableFlatList
        data={sequenceDuas}
        renderItem={renderSequenceDuaItem}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => setSequenceDuas(data.map((item, index) => ({ ...item, order: index + 1 })))}
        style={styles.duaList}
      />
      <Text style={styles.sectionTitle}>Available Duas</Text>
      <FlatList
        data={availableDuas}
        renderItem={renderAvailableDuaItem}
        keyExtractor={(item) => item.id}
        style={styles.duaList}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  duaList: {
    maxHeight: 200,
  },
  duaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  availableDuaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  activeItem: {
    backgroundColor: '#e0e0e0',
  },
  orderNumber: {
    marginRight: 10,
    fontWeight: 'bold',
  },
  duaTitle: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
