// File: app/_layout.tsx

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { useRouter, SplashScreen, Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { setupNotifications, cancelAllNotifications, clearOrphanedNotifications } from '../utils/notificationHandler';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useColorScheme, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootSiblingParent } from 'react-native-root-siblings';
import { DuaProvider, useDua } from '@/contexts/DuaContext';
import { getOrCreateUserId } from '@/api';
import { debounce } from 'lodash';
import { MenuProvider } from 'react-native-popup-menu';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function initializeApp() {
      try {
        if (loaded) {
          const id = await getOrCreateUserId();
          setUserId(id);
          await SplashScreen.hideAsync();

          // Clear all notifications when the app starts
          await cancelAllNotifications();

          // Set up notifications
          setupNotifications();
        }
      } catch (e) {
        console.error('Failed to initialize app:', e);
        setInitError(e instanceof Error ? e : new Error('Failed to initialize app'));
        await SplashScreen.hideAsync();
      }
    }
    initializeApp();
  }, [loaded]);

  if (!loaded || (!userId && !initError)) {
    return null;
  }

  if (initError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error initializing app: {initError.message}</Text>
      </View>
    );
  }

  return <RootLayoutNav userId={userId!} />;
}

function RootLayoutNav({ userId }: { userId: string }) {
  const colorScheme = useColorScheme();

  return (
    <DuaProvider>
      <InnerLayout colorScheme={colorScheme} />
    </DuaProvider>
  );
}

function InnerLayout({ colorScheme }: { colorScheme: string | null }) {
  const { collections } = useDua();
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();

  const handleNotification = useCallback((response: Notifications.NotificationResponse) => {
    const collectionId = response.notification.request.content.data?.collectionId;
    if (collectionId) {
      // Check if the collection exists
      const collectionExists = collections.some(collection => collection._id === collectionId);
      if (collectionExists) {
        // Debounce the router push
        debounce(() => {
          router.push(`/collection/${collectionId}`);
        }, 300)();
      } else {
        // If the collection doesn't exist, cancel the notification
        Notifications.cancelScheduledNotificationAsync(response.notification.request.identifier);
        console.log('Notification cancelled for non-existent collection:', collectionId);
      }
    }
  }, [router, collections]);

  useEffect(() => {
    const clearOrphans = async () => {
      const collectionIds = collections.map(c => c._id);
      await clearOrphanedNotifications(collectionIds);
    };

    // Clear orphaned notifications immediately when collections change
    clearOrphans();

    // Set up a periodic check (every 5 minutes)
    const intervalId = setInterval(clearOrphans, 5 * 60 * 1000);

    // Add notification response listener
    notificationListener.current = Notifications.addNotificationResponseReceivedListener(handleNotification);

    // Cleanup function
    return () => {
      clearInterval(intervalId);
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
    };
  }, [collections, handleNotification]);

  return (
    <View style={{ flex: 1 }}>
      <MenuProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootSiblingParent>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                <Stack.Screen
                  name="collection/[id]"
                  options={{
                    presentation: 'modal',
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="dua/[id]"
                  options={{
                    presentation: 'modal',
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="settings"
                  options={{
                    presentation: 'modal',
                    title: 'Settings',
                  }}
                />
                <Stack.Screen
                  name="archived"
                  options={{
                    presentation: 'modal',
                    headerShown: false,
                  }}
                />
              </Stack>
            </ThemeProvider>
          </RootSiblingParent>
        </GestureHandlerRootView>
      </MenuProvider>
    </View>
  );
}
