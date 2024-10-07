// File: app/(tabs)/dua.tsx
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, TouchableOpacity, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import DuaItem from '@/components/DuaItem';
import { useDua } from '@/contexts/DuaContext';
import { Dua } from '@/types/dua';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';

export default function DuaScreen() {
  const { duas, fetchDuas, removeDua } = useDua();
  const [localDuas, setLocalDuas] = useState<Dua[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [deletedDua, setDeletedDua] = useState<{ dua: Dua, index: number } | null>(null);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchDuas();
  }, []);

  useEffect(() => {
    setLocalDuas(duas);
  }, [duas]);

  const handleRefresh = () => {
    fetchDuas();
  };

  const handleDelete = (dua: Dua) => {
    const index = localDuas.findIndex(d => d._id === dua._id);
    setLocalDuas(prevDuas => prevDuas.filter(d => d._id !== dua._id));
    setDeletedDua({ dua, index });
    setToastMessage('Dua deleted. Tap to undo.');

    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
    }

    deleteTimeoutRef.current = setTimeout(() => {
      removeDua(dua._id);
      setToastMessage('');
      setDeletedDua(null);
    }, 5000);
  };

  const handleUndo = () => {
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }

    if (deletedDua) {
      setLocalDuas(prevDuas => {
        const newDuas = [...prevDuas];
        newDuas.splice(deletedDua.index, 0, deletedDua.dua);
        return newDuas;
      });
      setDeletedDua(null);
    }

    setToastMessage('');
  };

  const renderRightActions = (dua: Dua) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(dua)}>
      <Ionicons name="trash-outline" size={24} color="white" />
    </TouchableOpacity>
  );

  const renderDuaItem = ({ item }: { item: Dua }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <DuaItem dua={item} />
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Duas</Text>
      <FlatList
        data={localDuas}
        renderItem={renderDuaItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={handleRefresh} />
        }
      />
      {toastMessage && deletedDua && (
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
          <TouchableOpacity onPress={handleUndo}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </TouchableOpacity>
        </Toast>
      )}
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
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  toastText: {
    color: 'white',
  },
});
