// File: app/(tabs)/_layout.tsx

import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const openSettings = () => {
    router.push('/settings');
  };

  const createNewCollection = () => {
    router.push('/create-collection');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="dua"
        options={{
          title: 'My Duas',  // Changed from 'Duas' to 'My Duas'
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
          headerRight: () => (
            <TouchableOpacity onPress={openSettings} style={{ marginRight: 15 }}>
              <FontAwesome name="cog" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <TabBarIcon name="plus" color={color} />,
          headerRight: () => (
            <TouchableOpacity onPress={openSettings} style={{ marginRight: 15 }}>
              <FontAwesome name="cog" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: 'Collections',  // Changed from 'Collection' to 'Collections'
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          headerRight: () => (
            <TouchableOpacity onPress={createNewCollection} style={{ marginRight: 15 }}>
              <Ionicons name="add" size={28} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
