// File: app/sequence/[id].tsx

import React, { useRef, useState } from 'react';
import { StyleSheet, Dimensions, FlatList, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useDua } from '@/contexts/DuaContext';
import { useLocalSearchParams } from 'expo-router';
import DuaDetails from '@/components/DuaDetails';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SequenceViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { duas, sequences } = useDua();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const sequence = sequences.find(seq => seq.id === id);
  const sequenceDuas = sequence ? sequence.duaIds.map(duaId => duas.find(dua => dua.id === duaId)!).filter(Boolean) : [];

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  if (!sequence) {
    return <Text>Sequence not found</Text>;
  }

  return (
    <RNView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={sequenceDuas}
        renderItem={({ item }) => (
          <RNView style={styles.duaContainer}>
            <DuaDetails dua={item} />
          </RNView>
        )}
        keyExtractor={(item) => item.id}
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
        <Text style={styles.paginationText}>{`${currentIndex + 1} / ${sequenceDuas.length}`}</Text>
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
});
