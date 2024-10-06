// File: app/(tabs)/sequences.tsx

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View as RNView, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useDua } from '@/contexts/DuaContext';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SequencesScreen() {
  const { sequences, fetchSequences, deleteSequence } = useDua();
  const router = useRouter();
  const [localSequences, setLocalSequences] = useState(sequences);
  const deleteTimeoutRef = useRef(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchSequences();
  }, []);

  useEffect(() => {
    setLocalSequences(sequences);
  }, [sequences]);

  const handleSequencePress = (sequenceId: string) => {
    router.push(`/sequence/${sequenceId}`);
  };

  const handleDelete = (sequence) => {
    // Immediately remove from local state
    setLocalSequences(prevSequences => prevSequences.filter(seq => seq.id !== sequence.id));

    // Show toast with undo option
    setToastMessage('Sequence deleted. Tap to undo.');

    // Set up deletion after 5 seconds
    deleteTimeoutRef.current = setTimeout(() => {
      deleteSequence(sequence.id);
      setToastMessage('');
    }, 5000);
  };

  const handleUndo = () => {
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }

    // Restore sequences from the backend
    fetchSequences();
    setToastMessage('');
  };

  const renderRightActions = (sequence) => (
    <RNView style={styles.rightAction}>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(sequence)}>
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    </RNView>
  );

  const renderSequenceItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item)}
      rightThreshold={-100}
    >
      <TouchableOpacity
        style={styles.sequenceItem}
        onPress={() => handleSequencePress(item.id)}
      >
        <Text style={styles.sequenceName}>{item.name}</Text>
        <Text style={styles.sequenceCount}>{item.duaIds.length} duas</Text>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Sequences</Text>
      <FlatList
        data={localSequences}
        renderItem={renderSequenceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/create-sequence')}
      >
        <Text style={styles.createButtonText}>Create New Sequence</Text>
      </TouchableOpacity>
      {toastMessage ? (
        <Toast
          visible={!!toastMessage}
          position={Toast.positions.BOTTOM}
          shadow={false}
          animation={false}
          hideOnPress={false}
          duration={5000}
          onHidden={() => setToastMessage('')}
          onPress={handleUndo}
        >
          <TouchableOpacity onPress={handleUndo} style={styles.toastContainer}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </TouchableOpacity>
        </Toast>
      ) : null}
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
    backgroundColor: 'white',
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
  rightAction: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  toastContainer: {
    width: SCREEN_WIDTH * 0.9,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
  },
  toastText: {
    color: 'white',
    textAlign: 'center',
  },
});
