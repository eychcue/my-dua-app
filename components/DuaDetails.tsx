// File: components/DuaDetails.tsx

import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Dimensions, View as RNView, Modal, TouchableWithoutFeedback, Share, SafeAreaView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Dua } from '@/types/dua';
import { useDua } from '@/contexts/DuaContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  dua: Dua;
  onClose: () => void;
};

export default function DuaDetails({ dua, onClose }: Props) {
  const { markAsRead, readCounts, archiveDua, removeDua, isOnline } = useDua();
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleMarkAsRead = useCallback(async () => {
    if (isMarkingAsRead) return;
    setIsMarkingAsRead(true);
    await markAsRead(dua._id);
    if (!isOnline) {
      setShowOfflineIndicator(true);
      setTimeout(() => setShowOfflineIndicator(false), 2000);
    }
    setIsMarkingAsRead(false);
  }, [dua._id, markAsRead, isOnline, isMarkingAsRead]);

  const handleArchive = async () => {
    if (isOnline) {
      await archiveDua(dua._id);
      onClose();
    } else {
      alert("Archiving is not available offline. Please try again when you're back online.");
    }
    setModalVisible(false);
  };

  const handleDelete = async () => {
    if (isOnline) {
      await removeDua(dua._id);
      onClose();
    } else {
      alert("Deleting is not available offline. Please try again when you're back online.");
    }
    setModalVisible(false);
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}`,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleModal}>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{dua.title}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.duaCard}>
          <Text style={styles.arabic}>{dua.arabic}</Text>
          <Text style={styles.transliteration}>{dua.transliteration}</Text>
          <Text style={styles.translation}>{dua.translation}</Text>
          {dua.description && (
            <Text style={styles.description}>{dua.description}</Text>
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.readButton, isMarkingAsRead && styles.disabledButton]}
            onPress={handleMarkAsRead}
            disabled={isMarkingAsRead}
          >
            <Ionicons name="book-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>
              {isMarkingAsRead ? 'Marking...' : 'Mark as Read'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.readCount}>
          Read {readCounts[dua._id] || 0} times
          {!isOnline && showOfflineIndicator && " (Saved offline)"}
        </Text>
      </View>
      {!isOnline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>Offline Mode</Text>
        </View>
      )}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleArchive}
                >
                  <Ionicons name="archive-outline" size={24} color="#4B5563" />
                  <Text style={styles.modalOptionText}>Archive</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={24} color="#EF4444" />
                  <Text style={styles.modalOptionText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalOption, styles.cancelButton]}
                  onPress={toggleModal}
                >
                  <Text style={[styles.modalOptionText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  closeButton: {
    padding: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  duaCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  arabic: {
    fontSize: 28,
    textAlign: 'right',
    marginBottom: 15,
    fontFamily: 'Arabic',
    color: '#1F2937',
  },
  transliteration: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 15,
    textAlign: 'left',
    color: '#4B5563',
  },
  translation: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 15,
    color: '#374151',
  },
  description: {
    fontSize: 14,
    textAlign: 'left',
    fontStyle: 'italic',
    color: '#6B7280',
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    width: '48%',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  readButton: {
    backgroundColor: '#4CAF50',
  },
  shareButton: {
    backgroundColor: '#3B82F6',
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  readCount: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  offlineIndicator: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  offlineText: {
    color: 'white',
    fontSize: 12,
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
