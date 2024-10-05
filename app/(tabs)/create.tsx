// File: app/(tabs)/create.tsx

import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Dua } from '@/types/dua';
import { useDua } from '@/contexts/DuaContext';

export default function CreateScreen() {
  const [description, setDescription] = useState('');
  const [duaLength, setDuaLength] = useState<'short' | 'long'>('short');
  const [generatedDua, setGeneratedDua] = useState<Dua | null>(null);
  const { addDua } = useDua();

  const generateDua = () => {
    // This is where you'd call your API to generate the dua
    // For now, we'll use a dummy dua
    const dummyDua: Dua = {
      id: `dua${Math.floor(Math.random() * 1000)}`,
      title: `Dua for ${description}`,
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
      transliteration: 'Bismillah ir-Rahman ir-Rahim',
      translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
    };
    setGeneratedDua(dummyDua);
  };

  const handleAddDua = () => {
    if (generatedDua) {
      addDua(generatedDua);
      setDescription('');
      setDuaLength('short');
      setGeneratedDua(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create a New Dua</Text>
      <TextInput
        style={styles.input}
        onChangeText={setDescription}
        value={description}
        placeholder="Enter dua description"
      />
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={[styles.radioButton, duaLength === 'short' && styles.radioButtonSelected]}
          onPress={() => setDuaLength('short')}
        >
          <Text>Short</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioButton, duaLength === 'long' && styles.radioButtonSelected]}
          onPress={() => setDuaLength('long')}
        >
          <Text>Long</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={generateDua}>
        <Text style={styles.buttonText}>Generate Dua</Text>
      </TouchableOpacity>
      {generatedDua && (
        <View style={styles.generatedDua}>
          <Text style={styles.duaTitle}>{generatedDua.title}</Text>
          <Text style={styles.duaArabic}>{generatedDua.arabic}</Text>
          <Text style={styles.duaTransliteration}>{generatedDua.transliteration}</Text>
          <Text style={styles.duaTranslation}>{generatedDua.translation}</Text>
          <TouchableOpacity style={styles.button} onPress={handleAddDua}>
            <Text style={styles.buttonText}>Add Dua</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  radioButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
  },
  radioButtonSelected: {
    backgroundColor: 'lightblue',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  generatedDua: {
    marginTop: 20,
    alignItems: 'center',
  },
  duaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  duaArabic: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'right',
  },
  duaTransliteration: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  duaTranslation: {
    fontSize: 16,
    marginBottom: 20,
  },
});
