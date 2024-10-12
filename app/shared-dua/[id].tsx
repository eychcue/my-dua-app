// In app/shared-dua/[id].tsx

import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDua } from '@/contexts/DuaContext';
import DuaDetails from '@/components/DuaDetails';
import { Dua } from '@/types/dua';
import api from '@/api';

export default function SharedDuaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { duas, addDua } = useDua();
  const [sharedDua, setSharedDua] = useState<Dua | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSharedDua = async () => {
      try {
        const response = await api.get(`/shared-dua/${id}`);
        setSharedDua(response.data.dua);
      } catch (err) {
        setError('Failed to load shared dua');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedDua();
  }, [id]);

  const handleClose = () => {
    router.back();
  };

  const handleAddDua = async () => {
    if (sharedDua) {
      await addDua(sharedDua);
      router.push('/dua');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sharedDua && (
        <>
          <DuaDetails dua={sharedDua} onClose={handleClose} />
          {!duas.some(d => d._id === sharedDua._id) && (
            <TouchableOpacity style={styles.addButton} onPress={handleAddDua}>
              <Text style={styles.addButtonText}>Add Dua</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
