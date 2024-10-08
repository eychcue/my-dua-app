// app/(tabs)/archived.tsx

import React, { useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import DuaItem from '@/components/DuaItem';
import { useDua } from '@/contexts/DuaContext';
import { Dua } from '@/types/dua';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ArchivedDuasScreen() {
  const { archivedDuas, fetchArchivedDuas, unarchiveDua } = useDua();
  const router = useRouter();

  useEffect(() => {
    fetchArchivedDuas();
  }, []);

  const handleUnarchive = async (dua: Dua) => {
    try {
      await unarchiveDua(dua._id);
      fetchArchivedDuas(); // Refresh the list after unarchiving
    } catch (error) {
      console.error('Error unarchiving dua:', error);
    }
  };

  const renderRightActions = (dua: Dua) => (
    <TouchableOpacity style={styles.unarchiveButton} onPress={() => handleUnarchive(dua)}>
      <Ionicons name="archive-outline" size={24} color="white" />
    </TouchableOpacity>
  );

  const handleDuaPress = (dua: Dua) => {
    router.push(`/dua/${dua._id}`);
  };

  const renderDuaItem = ({ item }: { item: Dua }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <DuaItem dua={item} onPress={() => handleDuaPress(item)} />
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Archived Duas</Text>
      <FlatList
        data={archivedDuas}
        renderItem={renderDuaItem}
        keyExtractor={(item) => item._id}
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
  unarchiveButton: {
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
});
