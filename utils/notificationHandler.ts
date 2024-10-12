// utils/notificationHandler.ts
import * as Notifications from 'expo-notifications';
import { Collection } from '../types/dua';
import { getUserCollections } from '../api';
import { getOfflineCollections } from './offlineStorage';

export const setupNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

export const scheduleCollectionNotification = async (collection: Collection) => {
  if (!collection.notification_enabled || !collection.scheduled_time) {
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return;
  }

  const notificationId = collection._id;

  await cancelCollectionNotification(notificationId);

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
    identifier: notificationId,
  });
};

export const cancelCollectionNotification = async (collectionId: string) => {
  await Notifications.cancelScheduledNotificationAsync(collectionId);
};

export const clearOrphanedNotifications = async (isOnline: boolean) => {
  try {
    let collections: Collection[] = [];

    if (isOnline) {
      try {
        collections = await getUserCollections();
      } catch (error) {
        console.error('Failed to fetch collections from server:', error);
        // Fallback to offline collections
        collections = await getOfflineCollections();
      }
    } else {
      collections = await getOfflineCollections();
    }

    // Get all scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    // Create a set of valid collection IDs
    const validCollectionIds = new Set(collections.map(c => c._id));

    // Cancel notifications for non-existent collections
    for (const notification of scheduledNotifications) {
      const collectionId = notification.identifier;
      if (!validCollectionIds.has(collectionId)) {
        await cancelCollectionNotification(collectionId);
      }
    }

    // Schedule notifications for collections that don't have one
    for (const collection of collections) {
      if (collection.notification_enabled && collection.scheduled_time) {
        const hasNotification = scheduledNotifications.some(n => n.identifier === collection._id);
        if (!hasNotification) {
          await scheduleCollectionNotification(collection);
        }
      }
    }

    console.log('Orphaned notifications cleared and missing notifications scheduled');
  } catch (error) {
    console.error('Error clearing orphaned notifications:', error);
  }
};
