import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FeatureFlags {
  subscriptionEnabled: boolean;
}

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  toggleSubscriptionFeature: () => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

const FEATURE_FLAGS_KEY = 'featureFlags';

export const FeatureFlagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>({
    subscriptionEnabled: false, // default to false
  });

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      const savedFlags = await AsyncStorage.getItem(FEATURE_FLAGS_KEY);
      if (savedFlags) {
        setFlags(JSON.parse(savedFlags));
      }
    } catch (error) {
      console.error('Error loading feature flags:', error);
    }
  };

  const saveFlags = async (newFlags: FeatureFlags) => {
    try {
      await AsyncStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(newFlags));
      setFlags(newFlags);
    } catch (error) {
      console.error('Error saving feature flags:', error);
    }
  };

  const toggleSubscriptionFeature = async () => {
    const newFlags = {
      ...flags,
      subscriptionEnabled: !flags.subscriptionEnabled,
    };
    await saveFlags(newFlags);
  };

  return (
    <FeatureFlagsContext.Provider
      value={{
        flags,
        toggleSubscriptionFeature,
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
