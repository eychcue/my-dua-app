import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Dua } from '@/types/dua';

type Props = {
  dua: Dua;
};

export default function DuaItem({ dua }: Props) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/dua/${dua.id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{dua.title}</Text>
        <Text style={styles.preview} numberOfLines={2}>{dua.translation}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  preview: {
    fontSize: 14,
    color: '#666',
  },
});
