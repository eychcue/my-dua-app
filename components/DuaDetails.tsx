// File: components/DuaDetails.tsx

import React from 'react';
import { StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Dua } from '@/types/dua';
import { useDua } from '@/contexts/DuaContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  dua: Dua;
  onRead?: () => void;
};

export default function DuaDetails({ dua, onRead }: Props) {
  const { markDuaAsRead, getReadCount } = useDua();

  const handleRead = () => {
    markDuaAsRead(dua.id);
    if (onRead) {
      onRead();
    }
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
        <View style={styles.separator} />
        <Text style={styles.readCount}>Read {getReadCount(dua.id)} times</Text>
        <TouchableOpacity style={styles.readButton} onPress={handleRead}>
          <Text style={styles.readButtonText}>Mark as Read</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  arabic: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 50,
    color: '#1a5f7a',
  },
  transliteration: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
    color: '#57837b',
  },
  translation: {
    fontSize: 16,
    textAlign: 'center',
    color: '#515151',
  },
  separator: {
    height: 1,
    width: '80%',
    backgroundColor: '#ced4da',
    marginVertical: 15,
  },
  readCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  readButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  readButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
