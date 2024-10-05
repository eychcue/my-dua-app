// File: app/(tabs)/dua.tsx

import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import DuaItem from '@/components/DuaItem';
import { useDua } from '@/contexts/DuaContext';

export default function DuaScreen() {
  const { duas } = useDua();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Duas</Text>
      <FlatList
        data={duas}
        renderItem={({ item }) => <DuaItem dua={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
