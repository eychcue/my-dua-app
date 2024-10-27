// File: contexts/FeatureFlagsContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { FREE_GENERATIONS_KEY } from '@/contexts/SubscriptionContext';

interface FeatureFlags {
  subscriptionEnabled: boolean;
}

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  toggleSubscriptionFeature: () => Promise<void>;
  resetGenerations: () => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

const FEATURE_FLAGS_KEY = 'featureFlags';

// Check if we're in development mode
const isDevelopment = __DEV__;

const getDefaultFlags = (): FeatureFlags => ({
  // Default to false in development, true in production
  subscriptionEnabled: !isDevelopment,
});

export const FeatureFlagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>(getDefaultFlags());

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      const savedFlags = await AsyncStorage.getItem(FEATURE_FLAGS_KEY);
      if (savedFlags) {
        // In development, use saved flags
        // In production, force subscriptionEnabled to true
        if (isDevelopment) {
          setFlags(JSON.parse(savedFlags));
        } else {
          setFlags({
            ...JSON.parse(savedFlags),
            subscriptionEnabled: true,
          });
        }
      }
    } catch (error) {
      console.error('Error loading feature flags:', error);
    }
  };

  const saveFlags = async (newFlags: FeatureFlags) => {
    try {
      // In production, force subscriptionEnabled to true
      const flagsToSave = isDevelopment
        ? newFlags
        : { ...newFlags, subscriptionEnabled: true };

      await AsyncStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(flagsToSave));
      setFlags(flagsToSave);
    } catch (error) {
      console.error('Error saving feature flags:', error);
    }
  };

  const toggleSubscriptionFeature = async () => {
    // Only allow toggling in development mode
    if (isDevelopment) {
      const newFlags = {
        ...flags,
        subscriptionEnabled: !flags.subscriptionEnabled,
      };
      await saveFlags(newFlags);
    }
  };

  const resetGenerations = async () => {
    try {
      await AsyncStorage.setItem(FREE_GENERATIONS_KEY, '3');
    } catch (error) {
      console.error('Error resetting generations:', error);
      throw error;
    }
  };

  return (
    <FeatureFlagsContext.Provider
      value={{
        flags,
        toggleSubscriptionFeature,
        resetGenerations,
      }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
};
