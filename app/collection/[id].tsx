// File: app/collection/[id].tsx

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { StyleSheet, Dimensions, FlatList, View as RNView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useDua } from '@/contexts/DuaContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DuaDetails from '@/components/DuaDetails';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CollectionViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { duas, collections, batchMarkAsRead } = useDua();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

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
    // Batch mark all viewed duas as read when closing the collection
    const viewedDuaIds = collectionDuas.slice(0, currentIndex + 1).map(dua => dua._id);
    if (viewedDuaIds.length > 0) {
      batchMarkAsRead(viewedDuaIds).catch(error => {
        console.error('Failed to batch mark duas as read:', error);
      });
    }
    router.back();
  };

  if (!collection) {
    return <Text>Collection not found</Text>;
  }

  if (collectionDuas.length === 0) {
    return <Text>No duas found in this collection</Text>;
  }

  return (
    <RNView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={24} color="black" />
      </TouchableOpacity>
      <FlatList
        ref={flatListRef}
        data={collectionDuas}
        renderItem={({ item }) => (
          <RNView style={styles.duaContainer}>
            <DuaDetails dua={item} onRead={handleDuaRead} />
          </RNView>
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
      <RNView style={styles.pagination}>
        <Text style={styles.paginationText}>{`${currentIndex + 1} / ${collectionDuas.length}`}</Text>
      </RNView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  duaContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  paginationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
});
