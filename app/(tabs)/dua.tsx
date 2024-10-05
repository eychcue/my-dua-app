// File: app/(tabs)/dua.tsx

import React, { useEffect } from 'react';
import { StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import DuaItem from '@/components/DuaItem';
import { useDua } from '@/contexts/DuaContext';
import { Dua } from '@/types/dua';

export default function DuaScreen() {
  const { duas, fetchDuas } = useDua();

  useEffect(() => {
    fetchDuas();
  }, []);

  const handleRefresh = () => {
    fetchDuas();
  };

  const keyExtractor = (item: Dua, index: number) => {
    if (item._id) {
      return item._id;
    }
    // Fallback to using index if _id is not available
    return index.toString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Duas</Text>
      <FlatList
        data={duas}
        renderItem={({ item }) => <DuaItem dua={item} />}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={handleRefresh} />
        }
      />
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
});
