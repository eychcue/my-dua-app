// components/CollectionGridItem.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Collection, Dua } from '@/types/dua';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 48 = 3 * 16 (left, middle, and right padding)
const SNIPPET_SIZE = (ITEM_WIDTH - 24) / 2; // 24 = 3 * 8 (padding between snippets)

type Props = {
  collection: Collection;
  duas: Dua[];
  onPress: () => void;
};

const CollectionGridItem: React.FC<Props> = ({ collection, duas, onPress }) => {
  const previewDuas = duas.slice(0, 4);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.snippetContainer}>
        {previewDuas.map((dua, index) => (
          <View key={dua._id} style={styles.snippet}>
            <Text style={styles.snippetText} numberOfLines={2}>
              {dua.arabic}
            </Text>
          </View>
        ))}
        {[...Array(4 - previewDuas.length)].map((_, index) => (
          <View key={`empty-${index}`} style={[styles.snippet, styles.emptySnippet]} />
        ))}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {collection.name}
      </Text>
      <Text style={styles.count}>{collection.duaIds.length} duas</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    marginBottom: 16,
  },
  snippetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  snippet: {
    width: SNIPPET_SIZE,
    height: SNIPPET_SIZE,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  snippetText: {
    fontSize: 10,
    textAlign: 'center',
  },
  emptySnippet: {
    backgroundColor: '#e0e0e0',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    color: '#666',
  },
});

export default CollectionGridItem;
