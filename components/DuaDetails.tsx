// File: components/DuaDetails.tsx

import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Dua } from '@/types/dua';
import { useDua } from '@/contexts/DuaContext';

type Props = {
  dua: Dua;
};

export default function DuaDetails({ dua }: Props) {
  const { incrementReadCount, readCounts } = useDua();

  const handleRead = async () => {
    await incrementReadCount(dua._id);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{dua.title}</Text>
        <View style={styles.separator} />
        <Text style={styles.arabic}>{dua.arabic}</Text>
        <View style={styles.separator} />
        <Text style={styles.transliteration}>{dua.transliteration}</Text>
        <View style={styles.separator} />
        <Text style={styles.translation}>{dua.translation}</Text>
        {dua.description && (
          <>
            <View style={styles.separator} />
            <Text style={styles.description}>{dua.description}</Text>
          </>
        )}
        <Text style={styles.readCount}>Read {readCounts[dua._id] || 0} times</Text>
        <TouchableOpacity style={styles.readButton} onPress={handleRead}>
          <Text style={styles.readButtonText}>Mark as Read</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  arabic: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Arabic', // Make sure you have an appropriate Arabic font
  },
  transliteration: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  translation: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
  },
  separator: {
    height: 1,
    width: '80%',
    backgroundColor: '#CED0CE',
    marginVertical: 15,
  },
  readButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  readButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
