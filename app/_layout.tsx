// File: app/_layout.tsx

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { useRouter, SplashScreen, Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { setupNotifications } from '../utils/notificationHandler';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useColorScheme, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootSiblingParent } from 'react-native-root-siblings';
import { DuaProvider } from '@/contexts/DuaContext';
import { getOrCreateUserId } from '@/api';
import { debounce } from 'lodash';

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
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const handleNotification = useCallback((response: Notifications.NotificationResponse) => {
    const collectionId = response.notification.request.content.data?.collectionId;
    if (collectionId) {
      // Debounce the router push
      debounce(() => {
        router.push(`/collection/${collectionId}`);
      }, 300)();
    }
  }, [router]);

  useEffect(() => {
    async function initializeApp() {
      try {
        if (loaded) {
          const id = await getOrCreateUserId();
          setUserId(id);
          await SplashScreen.hideAsync();

          // Set up notifications
          setupNotifications();

          // Add notification response listener
          notificationListener.current = Notifications.addNotificationResponseReceivedListener(handleNotification);
        }
      } catch (e) {
        console.error('Failed to initialize app:', e);
        setInitError(e instanceof Error ? e : new Error('Failed to initialize app'));
        await SplashScreen.hideAsync();
      }
    }
    initializeApp();

    // Cleanup function
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
    };
  }, [loaded, handleNotification]);

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
                  headerShown: false, // Hide the header for this screen
                }}
              />
            </Stack>
          </ThemeProvider>
        </RootSiblingParent>
      </GestureHandlerRootView>
    </DuaProvider>
  );
}
