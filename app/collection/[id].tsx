// File: app/collection/[id].tsx
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { StyleSheet, Dimensions, FlatList, View as RNView } from 'react-native';
import { Text } from '@/components/Themed';
import { useDua } from '@/contexts/DuaContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import CollectionDuaDetails from '@/components/CollectionDuaDetails';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
      <FlatList
        ref={flatListRef}
        data={collectionDuas}
        renderItem={({ item, index }) => (
          <CollectionDuaDetails
            dua={item}
            onRead={handleDuaRead}
            currentIndex={index}
            totalDuas={collectionDuas.length}
            collectionName={collection.name}
            onClose={handleClose}
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
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
