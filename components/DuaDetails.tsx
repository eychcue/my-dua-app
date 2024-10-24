// File: components/DuaDetails.tsx

import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
  View as RNView,
  ScrollView,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Dua } from '@/types/dua';
import { useDua } from '@/contexts/DuaContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  dua: Dua;
  onClose?: () => void;
  isCreateContext?: boolean;
  isUserDua: boolean; // Add this prop
};

// Then in your DuaDetails component, use this prop instead of checking duas.some()
export default function DuaDetails({ dua, onClose, isCreateContext = false, isUserDua }: Props) {
  const { markAsRead, readCounts, archiveDua, removeDua, isOnline, duas, addDua } = useDua();
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [isAddingDua, setIsAddingDua] = useState(false);
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

  const handleAddToMyDuas = async () => {
    if (isAddingDua) return;
    setIsAddingDua(true);
    try {
      await addDua(dua);
      onClose?.();
    } catch (error) {
      console.error('Error adding dua:', error);
    } finally {
      setIsAddingDua(false);
    }
  };

  const handleArchive = async () => {
    if (isOnline) {
      await archiveDua(dua._id);
      onClose?.();
    } else {
      alert("Archiving is not available offline. Please try again when you're back online.");
    }
    setModalVisible(false);
  };

  const handleDelete = async () => {
    if (isOnline) {
      await removeDua(dua._id);
      onClose?.();
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
      const deepLink = `mydua://dua?id=${dua._id}`;
      const universalLink = `https://myduaapp.com/link/dua/${dua._id}`;
      const message = `Check out this dua:\n\n${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}\n\nOpen in app: ${universalLink}`;

      await Share.share({
        message: message,
        url: universalLink // This will be used as the shared URL on iOS
      });
    } catch (error) {
      console.error('Error sharing dua:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isCreateContext && (
        <View style={styles.header}>
          {isUserDua && (
            <TouchableOpacity onPress={toggleModal}>
              <MaterialCommunityIcons name="dots-horizontal" size={24} color="#333" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle} numberOfLines={1}>{dua.title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isCreateContext && (
          <Text style={styles.createContextTitle}>{dua.title}</Text>
        )}
        <View style={styles.duaCard}>
          <Text style={styles.arabic}>{dua.arabic}</Text>
          <Text style={styles.transliteration}>{dua.transliteration}</Text>
          <Text style={styles.translation}>{dua.translation}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.actionSection}>
          {isUserDua ? (
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
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.addButton, isAddingDua && styles.disabledButton]}
              onPress={handleAddToMyDuas}
              disabled={isAddingDua}
            >
              <Ionicons name="add-circle-outline" size={24} color="white" />
              <Text style={styles.actionButtonText}>
                {isAddingDua ? 'Adding...' : 'Add to Duas'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
        {isUserDua && (
          <Text style={styles.readCount}>
            Read {readCounts[dua._id] || 0} times
            {!isOnline && showOfflineIndicator && " (Saved offline)"}
          </Text>
        )}
      </View>

      {!isOnline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>Offline Mode</Text>
        </View>
      )}

      {!isCreateContext && isUserDua && (
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={toggleModal}
          animationType="none"
        >
          <TouchableWithoutFeedback onPress={toggleModal}>
            <RNView style={styles.modalOverlay}>
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
            </RNView>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  createContextTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  closeButton: {
    padding: 10,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  duaCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  arabic: {
    fontSize: 28,
    textAlign: 'right',
    marginBottom: 20,
    fontFamily: 'Arabic',
    color: '#1F2937',
    lineHeight: 42,
  },
  transliteration: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 15,
    textAlign: 'left',
    color: '#4B5563',
    lineHeight: 27,
  },
  translation: {
    fontSize: 16,
    textAlign: 'left',
    color: '#374151',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15,
    width: '48%',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  readButton: {
    backgroundColor: '#10B981',
  },
  shareButton: {
    backgroundColor: '#3B82F6',
  },
  addButton: {
    backgroundColor: '#4CAF50', // Green color for add button
  },
  disabledButton: {
    backgroundColor: '#A7F3D0',
  },
  readCount: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  offlineIndicator: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  offlineText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
