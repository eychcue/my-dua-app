// utils/notificationHandler.ts
import * as Notifications from 'expo-notifications';
import { Collection } from '../types/dua';

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
  console.log('Attempting to schedule notification for collection:', collection);

  if (!collection || !collection._id) {
    console.error('Attempted to schedule notification for invalid collection:', collection);
    return;
  }

  if (!collection.notification_enabled || !collection.scheduled_time) {
    console.log(`Notification not enabled or no scheduled time for collection: ${collection._id}`);
    return;
  }

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }

    const notificationIdentifier = `collection_${collection._id}`;

    console.log(`Cancelling existing notification for collection: ${collection._id}`);
    await Notifications.cancelScheduledNotificationAsync(notificationIdentifier);

    const trigger = new Date(collection.scheduled_time);

    console.log(`Scheduling new notification for collection: ${collection._id}`);
    console.log(`Notification time: ${trigger.toLocaleString()}`);

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
      identifier: notificationIdentifier,
    });

    console.log(`Notification scheduled successfully for collection: ${collection._id}`);
  } catch (error) {
    console.error(`Error scheduling notification for collection ${collection._id}:`, error);
  }
};

export const cancelCollectionNotification = async (collectionId: string) => {
  try {
    const notificationIdentifier = `collection_${collectionId}`;
    console.log(`Attempting to cancel notification for collection: ${collectionId}`);
    await Notifications.cancelScheduledNotificationAsync(notificationIdentifier);
    console.log(`Successfully cancelled notification for collection: ${collectionId}`);
  } catch (error) {
    console.error(`Error cancelling notification for collection ${collectionId}:`, error);
  }
};

export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

export const clearOrphanedNotifications = async (existingCollectionIds: string[]) => {
  try {
    console.log('Starting clearOrphanedNotifications');
    console.log('Existing collection IDs:', existingCollectionIds);

    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Total scheduled notifications: ${scheduledNotifications.length}`);

    const orphanedNotifications = scheduledNotifications.filter(notification => {
      const notificationId = notification.identifier;
      console.log(`Checking notification with identifier: ${notificationId}`);

      if (notificationId && notificationId.startsWith('collection_')) {
        const collectionId = notificationId.replace('collection_', '');
        if (collectionId === 'undefined') {
          console.log('Found notification with undefined collection ID');
          return true; // Consider notifications with 'undefined' ID as orphaned
        }
        const isOrphaned = !existingCollectionIds.includes(collectionId);
        if (isOrphaned) {
          console.log(`Orphaned notification found for collection ID: ${collectionId}`);
        }
        return isOrphaned;
      }
      return false;
    });

    console.log(`Orphaned notifications found: ${orphanedNotifications.length}`);

    await Promise.all(orphanedNotifications.map(async notification => {
      console.log(`Canceling notification with identifier: ${notification.identifier}`);
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }));

    console.log(`Cleared ${orphanedNotifications.length} orphaned notifications`);
  } catch (error) {
    console.error('Error clearing orphaned notifications:', error);
  }
};
