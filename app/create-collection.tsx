// File: app/create-collection.tsx

import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, FlatList, View as RNView, Switch, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useDua } from '@/contexts/DuaContext';
import { useRouter, Stack } from 'expo-router';
import { Dua } from '@/types/dua';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { scheduleCollectionNotification } from '../utils/notificationHandler';

export default function CreateCollectionScreen() {
  const [collectionName, setCollectionName] = useState('');
  const [selectedDuas, setSelectedDuas] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const { duas, addCollection, isOnline } = useDua();
  const router = useRouter();

  const handleCreateCollection = async () => {
    if (collectionName && selectedDuas.length > 0) {
      try {
        if (notificationEnabled && isOnline) {
          const permissionStatus = await checkNotificationPermissions();
          if (!permissionStatus) {
            setNotificationEnabled(false);
            return;
          }
        }

        const newCollection = {
          name: collectionName,
          duaIds: selectedDuas,
          scheduled_time: notificationEnabled ? scheduledTime.toISOString() : null,
          notification_enabled: notificationEnabled,
        };

        await addCollection(newCollection);

        router.back();
      } catch (error) {
        console.error('Failed to create collection:', error);
        Alert.alert('Error', 'Failed to create collection. Please try again.');
      }
    }
  };

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        Alert.alert('Permission Required', 'You need to grant notification permissions to enable this feature.');
        return false;
      }
    }
    return true;
  };

  const scheduleNotification = async (collection) => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('You need to grant notification permissions to enable this feature.');
        return;
      }
    }

    const trigger = new Date(collection.scheduled_time);
    trigger.setDate(trigger.getDate() + 1);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "It's time for your Dua collection",
        body: `Read your "${collection.name}" collection now`,
        data: { collectionId: collection._id },
      },
      trigger: {
        hour: trigger.getHours(),
        minute: trigger.getMinutes(),
        repeats: true,
      },
    });
  };

  const toggleDuaSelection = (duaId: string) => {
    setSelectedDuas(prev => {
      if (prev.includes(duaId)) {
        return prev.filter(id => id !== duaId);
      } else {
        return [...prev, duaId];
      }
    });
  };

  const getSelectionOrder = (duaId: string) => {
    const index = selectedDuas.indexOf(duaId);
    return index !== -1 ? index + 1 : null;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "New Collection",
          headerBackTitle: "Collections",
        }}
      />
      <Text style={styles.subtitle}>Select Duas:</Text>
      <FlatList
        data={duas}
        renderItem={({ item }: { item: Dua }) => (
          <TouchableOpacity
            style={[
              styles.duaItem,
              selectedDuas.includes(item._id) && styles.selectedDuaItem
            ]}
            onPress={() => toggleDuaSelection(item._id)}
          >
            <Text style={styles.duaTitle}>{item.title}</Text>
            {getSelectionOrder(item._id) && (
              <RNView style={styles.orderIndicator}>
                <Text style={styles.orderText}>{getSelectionOrder(item._id)}</Text>
              </RNView>
            )}
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.notificationContainer}>
        <Text>Enable daily notification</Text>
        <Switch
          value={notificationEnabled}
          onValueChange={setNotificationEnabled}
        />
      </View>
      {notificationEnabled && (
        <DateTimePicker
          value={scheduledTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedTime) => setScheduledTime(selectedTime || scheduledTime)}
        />
      )}
      <TouchableOpacity
        style={[
          styles.createButton,
          (!collectionName || selectedDuas.length === 0) && styles.disabledButton
        ]}
        onPress={handleCreateCollection}
        disabled={!collectionName || selectedDuas.length === 0}
      >
        <Text style={styles.createButtonText}>Create Collection</Text>
      </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  duaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedDuaItem: {
    backgroundColor: 'lightblue',
  },
  duaTitle: {
    fontSize: 16,
    flex: 1,
  },
  orderIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    color: 'white',
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
});
