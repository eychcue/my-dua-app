// File: app/collection/[id].tsx

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { StyleSheet, Dimensions, FlatList, View, Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { useDua } from '@/contexts/DuaContext';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import CollectionDuaDetails from '@/components/CollectionDuaDetails';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CollectionViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { duas, collections, deleteCollection } = useDua();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const [localCollections, setLocalCollections] = useState(collections);
  
  const collection = collections.find(seq => seq._id === id);
  const [collectionDuas, setCollectionDuas] = useState<Dua[]>([]);

  useEffect(() => {
    if (collection && duas.length > 0) {
      const filteredDuas = collection.duaIds
        .map(duaId => duas.find(dua => dua._id === duaId))
        .filter((dua): dua is Dua => dua !== undefined);
      setCollectionDuas(filteredDuas);
    }
  }, [collection, duas]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleDuaRead = useCallback(() => {
    if (currentIndex < collectionDuas.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  }, [currentIndex, collectionDuas.length]);

  const handleClose = () => {
    router.back();
  };

  const handleEditCollection = (collectionToEdit: Collection) => {
    router.back();
    router.push({
      pathname: '/edit-collection',
      params: { collectionId: collectionToEdit._id }
    });
  };

  const handleDeleteCollection = (collection: Collection) => {
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
              router.back();
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
  };

  if (!collection) {
    return <Text>Collection not found</Text>;
  }

  if (collectionDuas.length === 0) {
    return <Text>No duas found in this collection</Text>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <FlatList
        ref={flatListRef}
        data={collectionDuas}
        renderItem={({ item, index }) => (
          <CollectionDuaDetails
            dua={item}
            onRead={handleDuaRead}
            currentIndex={index}
            totalDuas={collectionDuas.length}
            collection={collection}
            onClose={handleClose}
            onEditCollection={handleEditCollection}
            onDeleteCollection={handleDeleteCollection}
          />
        )}
        keyExtractor={(item) => item._id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50
        }}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
