// File: app/(tabs)/collection.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View as RNView, Dimensions, RefreshControl, Modal, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useDua } from '@/contexts/DuaContext';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_MARGIN = 10;
const ITEM_WIDTH = (SCREEN_WIDTH - 40 - ITEM_MARGIN) / 2; // 40 = 2 * 20 (left and right padding)
const SNIPPET_SIZE = (ITEM_WIDTH - 2) / 2; // 2 = 2 * 1 (border width)

export default function CollectionsScreen() {
  const { collections, fetchCollections, deleteCollection, duas } = useDua();
  const router = useRouter();
  const [localCollections, setLocalCollections] = useState(collections);
  const deleteTimeoutRef = useRef(null);
  const [toastMessage, setToastMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  // useEffect(() => {
  //   fetchCollections();
  // }, []);

  useEffect(() => {
    setLocalCollections(collections);
  }, [collections]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCollections().then(() => setRefreshing(false));
  }, [fetchCollections]);

  const handleCollectionPress = (collectionId: string) => {
    router.push(`/collection/${collectionId}`);
  };

  const handleDelete = (collection) => {
    Alert.alert(
      "Delete Collection",
      "Are you sure you want to delete this collection?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setLocalCollections(prevCollections => prevCollections.filter(seq => seq._id !== collection._id));
              await deleteCollection(collection._id);
            } catch (error) {
              console.error('Failed to delete collection:', error);
              Alert.alert('Error', 'Failed to delete collection. Please try again.');
              // Revert the local state if the API call fails
              setLocalCollections(collections);
            }
          },
          style: "destructive"
        }
      ]
    );
    setModalVisible(false);
  };

  const handleEdit = (collection) => {
    router.push({
      pathname: '/edit-collection',
      params: { collectionId: collection._id }
    });
    setModalVisible(false);
  };

  const handleOptionsPress = (collection) => {
    setSelectedCollection(collection);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCollection(null);
  };

  const renderCollectionItem = ({ item, index }) => {
    const collectionDuas = item.duaIds.map(id => duas.find(dua => dua._id === id)).filter(Boolean).slice(0, 4);

    return (
      <TouchableOpacity
        style={[
          styles.collectionItem,
          index % 2 === 0 ? { marginRight: ITEM_MARGIN / 2 } : { marginLeft: ITEM_MARGIN / 2 }
        ]}
        onPress={() => handleCollectionPress(item._id)}
      >
        <View style={styles.snippetContainer}>
          {collectionDuas.map((dua, index) => (
            <View key={dua._id} style={styles.snippet}>
              <Text style={styles.snippetText} numberOfLines={2}>
                {dua.arabic}
              </Text>
            </View>
          ))}
          {[...Array(4 - collectionDuas.length)].map((_, index) => (
            <View key={`empty-${index}`} style={[styles.snippet, styles.emptySnippet]} />
          ))}
        </View>
        <Text style={styles.collectionName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.collectionCount}>{item.duaIds.length} duas</Text>
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={() => handleOptionsPress(item)}
        >
          <MaterialCommunityIcons name="dots-horizontal" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {localCollections.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            Tap the <Text style={styles.boldPlus}>+</Text> button in the top right
          </Text>
          <Text style={styles.emptyStateText}>
            to create your first collection
          </Text>
        </View>
      ) : (
        <FlatList
          data={localCollections}
          renderItem={renderCollectionItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={closeModal}
        >
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => selectedCollection && handleEdit(selectedCollection)}
            >
              <Ionicons name="pencil-outline" size={24} color="#4B5563" />
              <Text style={styles.modalOptionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => selectedCollection && handleDelete(selectedCollection)}
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
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  listContent: {
    paddingBottom: 20,
  },
  collectionItem: {
    width: ITEM_WIDTH,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    position: 'relative',
  },
  snippetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  snippet: {
    width: SNIPPET_SIZE,
    height: SNIPPET_SIZE,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  snippetText: {
    fontSize: 10,
    textAlign: 'center',
  },
  emptySnippet: {
    backgroundColor: '#f0f0f0',
  },
  collectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 8,
    paddingBottom: 4,
  },
  collectionCount: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  optionsButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 4,
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  boldPlus: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6', // Using a blue color to make it stand out
  },
});
