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
  if (!collection.notification_enabled || !collection.scheduled_time) {
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return;
  }

  await cancelCollectionNotification(collection._id);

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

export const cancelCollectionNotification = async (collectionId: string) => {
  await Notifications.cancelScheduledNotificationAsync(collectionId);
};
