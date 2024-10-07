// File: app/(tabs)/collection.tsx

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View as RNView, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useDua } from '@/contexts/DuaContext';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CollectionsScreen() {
  const { collections, fetchCollections, deleteCollection } = useDua();
  const router = useRouter();
  const [localCollections, setLocalCollections] = useState(collections);
  const deleteTimeoutRef = useRef(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    setLocalCollections(collections);
  }, [collections]);

  const handleCollectionPress = (collectionId: string) => {
    router.push(`/collection/${collectionId}`);
  };

  const handleDelete = (collection) => {
    setLocalCollections(prevCollections => prevCollections.filter(seq => seq._id !== collection._id));
    setToastMessage('Collection deleted. Tap to undo.');
    deleteTimeoutRef.current = setTimeout(() => {
      deleteCollection(collection._id);
      setToastMessage('');
    }, 5000);
  };

  const handleUndo = () => {
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }
    fetchCollections();
    setToastMessage('');
  };

  const handleEdit = (collection) => {
    router.push({
      pathname: '/edit-collection',
      params: { collectionId: collection._id }
    });
  };

  const renderRightActions = (collection) => (
    <RNView style={styles.rightActions}>
      <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(collection)}>
        <Ionicons name="pencil-outline" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(collection)}>
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    </RNView>
  );

  const renderCollectionItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item)}
      rightThreshold={-100}
    >
      <TouchableOpacity
        style={styles.collectionItem}
        onPress={() => handleCollectionPress(item._id)}
      >
        <Text style={styles.collectionName}>{item.name}</Text>
        <Text style={styles.collectionCount}>{item.duaIds.length} duas</Text>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Collections</Text>
      <FlatList
        data={localCollections}
        renderItem={renderCollectionItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/create-collection')}
      >
        <Text style={styles.createButtonText}>Create New Collection</Text>
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
  collectionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  collectionName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  collectionCount: {
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
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 160, // Increased width to accommodate both buttons
  },
  editButton: {
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
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
