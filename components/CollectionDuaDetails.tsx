import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Share,
  View as RNView,
  ScrollView,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Dua } from '@/types/dua';
import { useDua } from '@/contexts/DuaContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  dua: Dua;
  onRead: () => void;
  currentIndex: number;
  totalDuas: number;
  collectionName: string;
  onClose: () => void;
};

export default function CollectionDuaDetails({ dua, onRead, currentIndex, totalDuas, collectionName, onClose }: Props) {
  const { markAsRead, readCounts, isOnline, archiveDua, removeDua } = useDua();
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
    onRead();
  }, [dua._id, markAsRead, isOnline, isMarkingAsRead, onRead]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}`,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleOptions = () => {
    setModalVisible(true);
  };

  const handleArchive = async () => {
    try {
      await archiveDua(dua._id);
      setModalVisible(false);
      onClose(); // Close the dua view after archiving
    } catch (error) {
      console.error('Error archiving dua:', error);
      alert('Failed to archive dua. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await removeDua(dua._id);
      setModalVisible(false);
      onClose(); // Close the dua view after deleting
    } catch (error) {
      console.error('Error deleting dua:', error);
      alert('Failed to delete dua. Please try again.');
    }
  };

  return (
    <RNView style={styles.container}>
      <RNView style={styles.header}>
        <TouchableOpacity onPress={handleOptions} style={styles.headerButton}>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{collectionName}</Text>
        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </RNView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <RNView style={styles.progressContainer}>
          <Text style={styles.progressText}>{`${currentIndex + 1}/${totalDuas}`}</Text>
          <RNView style={styles.progressBar}>
            <RNView style={[styles.progressFill, { width: `${((currentIndex + 1) / totalDuas) * 100}%` }]} />
          </RNView>
        </RNView>

        <Text style={styles.title}>{dua.title}</Text>

        <View style={styles.duaCard}>
          <Text style={styles.arabic}>{dua.arabic}</Text>
          <Text style={styles.transliteration}>{dua.transliteration}</Text>
          <Text style={styles.translation}>{dua.translation}</Text>
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
        onRequestClose={() => setModalVisible(false)}
        animationType="none"
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
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
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.modalOptionText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </RNView>
        </TouchableWithoutFeedback>
      </Modal>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: SCREEN_WIDTH,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
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
