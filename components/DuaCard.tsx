// File: components/DuaCard.tsx

import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { Dua } from '@/types/dua';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  dua: Dua;
  onPress: () => void;
  onOptionsPress: () => void;
};

const DuaCard: React.FC<Props> = ({ dua, onPress, onOptionsPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} style={styles.content}>
        <Text style={styles.title}>{dua.title}</Text>
        <Text style={styles.preview} numberOfLines={2}>
          {dua.translation}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onOptionsPress} style={styles.optionsButton}>
        <MaterialCommunityIcons name="dots-horizontal" size={24} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    margin: 8,
    padding: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingRight: 30, // Make room for the options button
  },
  preview: {
    fontSize: 14,
    color: '#4B5563',
  },
  optionsButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
});

export default DuaCard;
