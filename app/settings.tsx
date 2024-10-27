// File: app/settings.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, View as RNView, Switch, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useDua } from '@/contexts/DuaContext';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Dua } from '@/types/dua';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DuaItem from '@/components/DuaItem';

export default function SettingsModal() {
  const { archivedDuas, fetchArchivedDuas, unarchiveDua } = useDua();
  const [showArchivedDuas, setShowArchivedDuas] = useState(false);
  const router = useRouter();
  const { flags, toggleSubscriptionFeature } = useFeatureFlags();
  const { freeGenerationsRemaining, resetGenerations } = useSubscription();

  useEffect(() => {
    fetchArchivedDuas();
  }, []);

  const handleResetGenerations = async () => {
    Alert.alert(
      "Reset Free Generations",
      "Are you sure you want to reset free generations back to 3?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset",
          onPress: async () => {
            try {
              await resetGenerations();
              Alert.alert("Success", "Free generations have been reset to 3");
            } catch (error) {
              console.error('Error resetting generations:', error);
              Alert.alert("Error", "Failed to reset generations");
            }
          }
        }
      ]
    );
  };

  const toggleArchivedDuas = () => {
    setShowArchivedDuas(!showArchivedDuas);
  };

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
      <Text style={styles.title}>Settings</Text>

      {__DEV__ && ( // Only show in development mode
        <>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Enable Subscription Feature</Text>
            <Switch
              value={flags.subscriptionEnabled}
              onValueChange={toggleSubscriptionFeature}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Free Generations Remaining</Text>
              <Text style={styles.generationsCount}>{freeGenerationsRemaining}</Text>
            </View>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetGenerations}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={toggleArchivedDuas}>
        <Text style={styles.buttonText}>
          {showArchivedDuas ? 'Hide Archived Duas' : 'Show Archived Duas'}
        </Text>
      </TouchableOpacity>

      {showArchivedDuas && (
        <View style={styles.archivedContainer}>
          <Text style={styles.subtitle}>Archived Duas</Text>
          <FlatList
            data={archivedDuas}
            renderItem={renderDuaItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}
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
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  archivedContainer: {
    flex: 1,
    marginTop: 20,
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  generationsCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  resetButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
