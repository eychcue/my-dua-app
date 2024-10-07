// File: app/_layout.tsx

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootSiblingParent } from 'react-native-root-siblings';
import { DuaProvider } from '@/contexts/DuaContext';
import { getOrCreateUserId } from '@/api';

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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootSiblingParent>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack initialRouteName="(tabs)">
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </ThemeProvider>
        </RootSiblingParent>
      </GestureHandlerRootView>
    </DuaProvider>
  );
}
