// File: app/(tabs)/create.tsx

import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Keyboard, TouchableWithoutFeedback, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { createDua } from '@/api';
import { useDua } from '@/contexts/DuaContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Dua } from '@/types/dua';
import DuaDetails from '@/components/DuaDetails';
import SubscriptionModal from '@/components/SubscriptionModal';

export default function CreateScreen() {
  const [description, setDescription] = useState('');
  const [generatedDua, setGeneratedDua] = useState<Dua | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { addDua } = useDua();
  const { isSubscribed, freeGenerationsRemaining, decrementFreeGenerations } = useSubscription();
  const scrollViewRef = useRef<ScrollView>(null);
  const generatedDuaRef = useRef<RNView>(null);

  const scrollToGeneratedDua = useCallback(() => {
    if (generatedDuaRef.current && scrollViewRef.current) {
      generatedDuaRef.current.measureLayout(
        scrollViewRef.current.getInnerViewNode(),
        (_, y) => {
          scrollViewRef.current?.scrollTo({ y: y, animated: true });
        }
      );
    }
  }, []);

  const handleCreateDua = async () => {
    if (!description.trim()) {
      setError('Please enter a dua description');
      return;
    }

    if (!isSubscribed && freeGenerationsRemaining === 0) {
      setShowSubscriptionModal(true);
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

      if (!isSubscribed) {
        await decrementFreeGenerations();
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
      // Delay scrolling to ensure the new dua is rendered
      setTimeout(scrollToGeneratedDua, 100);
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
      setSuccessMessage(`Your dua has been successfully added to "My Duas". May it bring you blessings and comfort.`);
      setDescription('');
      setGeneratedDua(null);
    } catch (err) {
      console.error('Error in handleAddDua:', err);
      setError('Failed to add dua. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setDescription('');
    setGeneratedDua(null);
    setError('');
    setSuccessMessage('');
  };

  const handleCancel = () => {
    resetForm();
  };

  const getGenerateButtonText = () => {
    if (isLoading) return '';
    if (isSubscribed) return 'Generate Dua';
    return `Generate Dua (${freeGenerationsRemaining} left)`;
  };  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Create a New Dua</Text>

        {!isSubscribed && freeGenerationsRemaining > 0 && (
          <View style={styles.freeGenerationsInfo}>
            <Text style={styles.freeGenerationsText}>
              You have {freeGenerationsRemaining} free {freeGenerationsRemaining === 1 ? 'generation' : 'generations'} remaining
            </Text>
            <Text style={styles.freeGenerationsSubtext}>
              Importing and sharing duas will always be free
            </Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={setDescription}
            value={description}
            placeholder="Enter your dua description here..."
            placeholderTextColor="#888"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={styles.hintText}>
            Tip: You can ask for duas related to various aspects of life, such as health, family, career, spirituality, or any specific situation you're facing.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            isLoading && styles.disabledButton,
            (!isSubscribed && freeGenerationsRemaining === 0) && styles.upgradeButton
          ]}
          onPress={handleCreateDua}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {!isSubscribed && freeGenerationsRemaining === 0
                ? 'Upgrade to Generate More Duas'
                : getGenerateButtonText()
              }
            </Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

        {generatedDua && (
          <RNView
            style={styles.generatedDuaContainer}
            ref={generatedDuaRef}
          >
            <DuaDetails dua={generatedDua} isCreateContext={true} />
            <TouchableOpacity
              style={[styles.button, isLoading && styles.disabledButton]}
              onPress={handleAddDua}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Add to My Duas</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </RNView>
        )}

        <SubscriptionModal
          visible={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    minHeight: 120,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 10,
    fontSize: 16,
  },
  successText: {
    color: '#4CAF50',
    marginBottom: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  generatedDuaContainer: {
    marginTop: 20,
    width: '100%',
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 0, //changed from 15 to 0
    padding: 10,
  },
  freeGenerationsInfo: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  freeGenerationsText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  freeGenerationsSubtext: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 5,
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: '#3B82F6',
  },
});
