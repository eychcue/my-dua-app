 // File: app/(tabs)/dua.tsx

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, TouchableOpacity, View as RNView, Modal, TouchableWithoutFeedback } from 'react-native';
import { Text, View } from '@/components/Themed';
import DuaCard from '@/components/DuaCard';
import { useDua } from '@/contexts/DuaContext';
import { Dua } from '@/types/dua';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';
import { useRouter } from 'expo-router';

export default function DuaScreen() {
  const { duas, fetchDuas, removeDua, archiveDua } = useDua();
  const [localDuas, setLocalDuas] = useState<Dua[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [deletedDua, setDeletedDua] = useState<{ dua: Dua, index: number } | null>(null);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);

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

    setModalVisible(false);
  };

  const handleArchive = async (dua: Dua) => {
    try {
      await archiveDua(dua._id);
      setLocalDuas(prevDuas => prevDuas.filter(d => d._id !== dua._id));
      setToastMessage('Dua archived');
    } catch (error) {
      console.error('Error archiving dua:', error);
      setToastMessage('Failed to archive dua');
    }
    setModalVisible(false);
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

  const handleDuaPress = (dua: Dua) => {
    router.push(`/dua/${dua._id}`);
  };

  const handleOptionsPress = (dua: Dua) => {
    setSelectedDua(dua);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDua(null);
  };

  const renderDuaItem = ({ item }: { item: Dua }) => (
    <DuaCard
      dua={item}
      onPress={() => handleDuaPress(item)}
      onOptionsPress={() => handleOptionsPress(item)}
    />
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
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => selectedDua && handleArchive(selectedDua)}
                >
                  <Ionicons name="archive-outline" size={24} color="#4B5563" />
                  <Text style={styles.modalOptionText}>Archive</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => selectedDua && handleDelete(selectedDua)}
                >
                  <Ionicons name="trash-outline" size={24} color="#EF4444" />
                  <Text style={styles.modalOptionText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalOption, styles.cancelButton]}
                  onPress={closeModal}
                >
                  <Text style={[styles.modalOptionText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {toastMessage && (
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
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  toastText: {
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalOptionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#1F2937',
  },
  cancelButton: {
    justifyContent: 'center',
    borderBottomWidth: 0,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#3B82F6',
    fontWeight: 'bold',
    marginLeft: 0,
  },
});
