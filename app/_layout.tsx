// File: app/_layout.tsx

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { useRouter, useSegments, SplashScreen, Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { setupNotifications, clearOrphanedNotifications } from '../utils/notificationHandler';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useColorScheme, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootSiblingParent } from 'react-native-root-siblings';
import { DuaProvider } from '@/contexts/DuaContext';
import { getOrCreateUserId } from '@/api';
import { debounce } from 'lodash';
import { MenuProvider } from 'react-native-popup-menu';
import NetInfo from '@react-native-community/netinfo';
import * as Linking from 'expo-linking';

const linking = {
  prefixes: ['mydua://', 'https://myduaapp.com'],
  config: {
    screens: {
      '(tabs)': {
        screens: {
          dua: 'dua',
        },
      },
      'dua': 'dua/:id',
    },
  },
};

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
  const segments = useSegments();
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

          // Clear orphaned notifications on app start
          const netInfo = await NetInfo.fetch();
          await clearOrphanedNotifications(netInfo.isConnected);

          // Set up periodic check for orphaned notifications
          const intervalId = setInterval(async () => {
            const currentNetInfo = await NetInfo.fetch();
            await clearOrphanedNotifications(currentNetInfo.isConnected);
          }, 5 * 60 * 1000); // Run every 5 minutes

          // Add notification response listener
          notificationListener.current = Notifications.addNotificationResponseReceivedListener(handleNotification);

          // Clean up function
          return () => {
            if (notificationListener.current) {
              Notifications.removeNotificationSubscription(notificationListener.current);
            }
            clearInterval(intervalId);
          };
        }
      } catch (e) {
        console.error('Failed to initialize app:', e);
        setInitError(e instanceof Error ? e : new Error('Failed to initialize app'));
        await SplashScreen.hideAsync();
      }
    }
    initializeApp();
  }, [loaded, handleNotification]);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log('Received deep link:', event.url);

      const url = new URL(event.url);
      console.log('Parsed URL:', url);

      const pathSegments = url.pathname.split('/').filter(Boolean);
      console.log('Path segments:', pathSegments);

      if (pathSegments.length >= 2 && pathSegments[0] === 'link' && pathSegments[1] === 'dua') {
        const duaId = pathSegments[2];
        console.log('Extracted dua ID:', duaId);

        if (duaId) {
          console.log('Navigating to dua with ID:', duaId);
          router.replace('/(tabs)');
          setTimeout(() => {
            router.push({
              pathname: '/dua/[id]',
              params: { id: duaId }
            });
          }, 100);
        }
      } else if (url.protocol === 'mydua:' && pathSegments[0] === 'dua') {
        const duaId = pathSegments[1];
        console.log('Extracted dua ID from custom scheme:', duaId);

        if (duaId) {
          console.log('Navigating to dua with ID:', duaId);
          router.replace('/(tabs)');
          setTimeout(() => {
            router.push({
              pathname: '/dua/[id]',
              params: { id: duaId }
            });
          }, 100);
        }
      } else {
        console.log('Unhandled deep link format');
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink as any);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

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
    <View style={{ flex: 1 }}>
      <MenuProvider>
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
                      animation: 'slide_from_bottom',
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
        </DuaProvider>
      </MenuProvider>
    </View>
  );
}

RootLayout.navigationOptions = {
  linking,
};
