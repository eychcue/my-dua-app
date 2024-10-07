// File: app/edit-collection.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View as RNView, Switch, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useDua } from '@/contexts/DuaContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';

export default function EditCollectionScreen() {
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>();
  const { collections, updateCollection, duas } = useDua();
  const router = useRouter();

  const [collection, setCollection] = useState(collections.find(seq => seq._id === collectionId));
  const [collectionName, setCollectionName] = useState(collection?.name || '');
  const [collectionDuas, setCollectionDuas] = useState<Array<{ id: string; title: string; order: number }>>([]);
  const [availableDuas, setAvailableDuas] = useState<Array<{ id: string; title: string }>>([]);
  const [scheduledTime, setScheduledTime] = useState(collection?.scheduled_time ? new Date(collection.scheduled_time) : new Date());
  const [notificationEnabled, setNotificationEnabled] = useState(collection?.notification_enabled || false);

  useEffect(() => {
    if (collection && duas.length > 0) {
      const orderedDuas = collection.duaIds.map((duaId, index) => {
        const dua = duas.find(d => d._id === duaId);
        return { id: duaId, title: dua?.title || 'Unknown Dua', order: index + 1 };
      });
      setCollectionDuas(orderedDuas);

      const availableDuasList = duas
        .filter(dua => !collection.duaIds.includes(dua._id))
        .map(dua => ({ id: dua._id, title: dua.title }));
      setAvailableDuas(availableDuasList);
    }
  }, [collection, duas]);

  const handleSave = async () => {
    if (collection) {
      const updatedCollection = {
        ...collection,
        name: collectionName,
        duaIds: collectionDuas.map(dua => dua.id),
        scheduled_time: notificationEnabled ? scheduledTime.toISOString() : null,
        notification_enabled: notificationEnabled,
      };
      await updateCollection(updatedCollection);

      if (notificationEnabled) {
        await scheduleNotification(updatedCollection);
      } else {
        await Notifications.cancelScheduledNotificationAsync(collection._id);
      }

      router.back();
    }
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

    await Notifications.cancelScheduledNotificationAsync(collection._id);

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
      identifier: collection._id,
    });
  };

  const renderCollectionDuaItem = ({ item, drag, isActive }: RenderItemParams<{ id: string; title: string; order: number }>) => (
    <TouchableOpacity
      style={[styles.duaItem, isActive && styles.activeItem]}
      onLongPress={drag}
    >
      <Text style={styles.orderNumber}>{item.order}</Text>
      <Text style={styles.duaTitle}>{item.title}</Text>
      <TouchableOpacity onPress={() => removeDuaFromCollection(item.id)}>
        <Ionicons name="remove-circle-outline" size={24} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAvailableDuaItem = ({ item }: { item: { id: string; title: string } }) => (
    <TouchableOpacity
      style={styles.availableDuaItem}
      onPress={() => addDuaToCollection(item.id)}
    >
      <Text style={styles.duaTitle}>{item.title}</Text>
      <Ionicons name="add-circle-outline" size={24} color="green" />
    </TouchableOpacity>
  );

  const addDuaToCollection = (duaId: string) => {
    const duaToAdd = availableDuas.find(dua => dua.id === duaId);
    if (duaToAdd) {
      setCollectionDuas(prev => [...prev, { ...duaToAdd, order: prev.length + 1 }]);
      setAvailableDuas(prev => prev.filter(dua => dua.id !== duaId));
    }
  };

  const removeDuaFromCollection = (duaId: string) => {
    const duaToRemove = collectionDuas.find(dua => dua.id === duaId);
    if (duaToRemove) {
      setCollectionDuas(prev => prev.filter(dua => dua.id !== duaId));
      setAvailableDuas(prev => [...prev, { id: duaId, title: duaToRemove.title }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Collection</Text>
      <TextInput
        style={styles.input}
        value={collectionName}
        onChangeText={setCollectionName}
        placeholder="Collection Name"
      />
      <Text style={styles.sectionTitle}>Duas in Collection</Text>
      <DraggableFlatList
        data={collectionDuas}
        renderItem={renderCollectionDuaItem}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => setCollectionDuas(data.map((item, index) => ({ ...item, order: index + 1 })))}
        style={styles.duaList}
      />
      <Text style={styles.sectionTitle}>Available Duas</Text>
      <FlatList
        data={availableDuas}
        renderItem={renderAvailableDuaItem}
        keyExtractor={(item) => item.id}
        style={styles.duaList}
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
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  duaList: {
    maxHeight: 200,
  },
  duaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  availableDuaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  activeItem: {
    backgroundColor: '#e0e0e0',
  },
  orderNumber: {
    marginRight: 10,
    fontWeight: 'bold',
  },
  duaTitle: {
    flex: 1,
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
