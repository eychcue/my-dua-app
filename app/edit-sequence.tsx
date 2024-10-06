// File: app/edit-sequence.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, FlatList, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useDua } from '@/contexts/DuaContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList from 'react-native-draggable-flatlist';

export default function EditSequenceScreen() {
  const { sequenceId } = useLocalSearchParams<{ sequenceId: string }>();
  const { sequences, updateSequence, duas } = useDua();
  const router = useRouter();

  const [sequence, setSequence] = useState(sequences.find(seq => seq.id === sequenceId));
  const [sequenceName, setSequenceName] = useState(sequence?.name || '');
  const [sequenceDuas, setSequenceDuas] = useState<Array<{ id: string; title: string; order: number }>>([]);

  useEffect(() => {
    if (sequence) {
      const orderedDuas = sequence.duaIds.map((duaId, index) => {
        const dua = duas.find(d => d._id === duaId);
        return { id: duaId, title: dua?.title || 'Unknown Dua', order: index + 1 };
      });
      setSequenceDuas(orderedDuas);
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

  const renderDuaItem = ({ item, drag, isActive }) => (
    <TouchableOpacity
      style={[styles.duaItem, isActive && styles.activeItem]}
      onLongPress={drag}
    >
      <Text style={styles.orderNumber}>{item.order}</Text>
      <Text style={styles.duaTitle}>{item.title}</Text>
      <Ionicons name="reorder-three" size={24} color="gray" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Sequence</Text>
      <TextInput
        style={styles.input}
        value={sequenceName}
        onChangeText={setSequenceName}
        placeholder="Sequence Name"
      />
      <DraggableFlatList
        data={sequenceDuas}
        renderItem={renderDuaItem}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => setSequenceDuas(data.map((item, index) => ({ ...item, order: index + 1 })))}
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
  duaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
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
