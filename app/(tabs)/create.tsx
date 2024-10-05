// File: app/(tabs)/create.tsx

import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { createDua } from '@/api';
import DuaDetails from '@/components/DuaDetails';
import { useDua } from '@/contexts/DuaContext';
import { Dua } from '@/types/dua';

export default function CreateScreen() {
  const [description, setDescription] = useState('');
  const [generatedDua, setGeneratedDua] = useState<Dua | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { addDua } = useDua();

  const handleCreateDua = async () => {
    if (!description.trim()) {
      setError('Please enter a dua description');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      console.log('Calling createDua with description:', description);
      const backendDua = await createDua(description);
      console.log('Received backendDua:', backendDua);
      if (!backendDua || !backendDua._id) {
        throw new Error('Invalid response from server');
      }
      const newDua: Dua = {
        _id: backendDua._id,
        title: backendDua.title,
        arabic: backendDua.arabic,
        transliteration: backendDua.transliteration,
        translation: backendDua.translation,
        description: backendDua.description,
      };
      setGeneratedDua(newDua);
    } catch (err) {
      console.error('Error in handleCreateDua:', err);
      setError(`Failed to generate dua: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDua = async () => {
    if (!generatedDua) return;
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await addDua(generatedDua);
      setSuccessMessage('Dua added successfully!');
      setDescription('');
      setGeneratedDua(null);
    } catch (err) {
      console.error('Error in handleAddDua:', err);
      setError('Failed to add dua. Please try again.');
    } finally {
      setIsLoading(false);
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
      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateDua}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Generate Dua</Text>
        )}
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

      {generatedDua && (
        <View style={styles.generatedDuaContainer}>
          <DuaDetails dua={generatedDua} />
          <TouchableOpacity
            style={styles.button}
            onPress={handleAddDua}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Add Dua</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  successText: {
    color: 'green',
    marginBottom: 10,
  },
  generatedDuaContainer: {
    marginTop: 20,
    width: '100%',
  },
});
