import React, { createContext, useContext, useState, useEffect } from 'react';
import * as InAppPurchases from 'expo-in-app-purchases';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const PRODUCTS = {
  MONTHLY: 'com.myduaapp.mydua.premium.monthly',
  YEARLY: 'com.myduaapp.mydua.premium.yearly'
};

const FREE_GENERATIONS_KEY = 'freeGenerationsRemaining';
const SUBSCRIPTION_STATUS_KEY = 'subscriptionStatus';

interface SubscriptionContextType {
  isSubscribed: boolean;
  freeGenerationsRemaining: number;
  products: InAppPurchases.IAPProductsResult | null;
  purchaseSubscription: (productId: string) => Promise<void>;
  decrementFreeGenerations: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  loading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [freeGenerationsRemaining, setFreeGenerationsRemaining] = useState(3);
  const [products, setProducts] = useState<InAppPurchases.IAPProductsResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeIAP();
    loadFreeGenerations();
    loadSubscriptionStatus();
  }, []);

  const loadFreeGenerations = async () => {
    try {
      const remaining = await AsyncStorage.getItem(FREE_GENERATIONS_KEY);
      if (remaining === null) {
        await AsyncStorage.setItem(FREE_GENERATIONS_KEY, '3');
        setFreeGenerationsRemaining(3);
      } else {
        setFreeGenerationsRemaining(parseInt(remaining));
      }
    } catch (error) {
      console.error('Error loading free generations:', error);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      const status = await SecureStore.getItemAsync(SUBSCRIPTION_STATUS_KEY);
      setIsSubscribed(status === 'true');
    } catch (error) {
      console.error('Error loading subscription status:', error);
    }
  };

  const initializeIAP = async () => {
    try {
      await InAppPurchases.connectAsync();

      // Set up purchase listener
      InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          results?.forEach(async (purchase) => {
            if (!purchase.acknowledged) {
              // Acknowledge the purchase
              await InAppPurchases.finishTransactionAsync(purchase, false);
            }

            // Update subscription status
            await SecureStore.setItemAsync(SUBSCRIPTION_STATUS_KEY, 'true');
            setIsSubscribed(true);
          });
        }
      });

      // Load products
      const { responseCode, results } = await InAppPurchases.getProductsAsync([
        PRODUCTS.MONTHLY,
        PRODUCTS.YEARLY
      ]);

      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        setProducts({ responseCode, results });
      }
    } catch (error) {
      console.error('Error initializing IAP:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseSubscription = async (productId: string) => {
    try {
      const { responseCode, results } = await InAppPurchases.purchaseItemAsync(productId);
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        // Purchase successful
        await SecureStore.setItemAsync(SUBSCRIPTION_STATUS_KEY, 'true');
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      throw error;
    }
  };

  const decrementFreeGenerations = async () => {
    if (freeGenerationsRemaining > 0) {
      const newCount = freeGenerationsRemaining - 1;
      await AsyncStorage.setItem(FREE_GENERATIONS_KEY, newCount.toString());
      setFreeGenerationsRemaining(newCount);
    }
  };

  const restorePurchases = async () => {
    try {
      const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();
      if (responseCode === InAppPurchases.IAPResponseCode.OK && results.length > 0) {
        // Found valid subscription
        await SecureStore.setItemAsync(SUBSCRIPTION_STATUS_KEY, 'true');
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        freeGenerationsRemaining,
        products,
        purchaseSubscription,
        decrementFreeGenerations,
        restorePurchases,
        loading
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export { PRODUCTS };
