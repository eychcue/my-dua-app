import React from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Text } from './Themed';
import { useSubscription, PRODUCTS } from '../contexts/SubscriptionContext';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ visible, onClose }: Props) {
  const { products, purchaseSubscription } = useSubscription();

  const handlePurchase = async (productId: string) => {
    try {
      await purchaseSubscription(productId);
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const monthlyProduct = products?.results.find(p => p.productId === PRODUCTS.MONTHLY);
  const yearlyProduct = products?.results.find(p => p.productId === PRODUCTS.YEARLY);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Upgrade to Premium</Text>

            <Text style={styles.description}>
              Generate unlimited duas and unlock the full potential of your spiritual journey.
              Import and share existing duas will always remain free.
            </Text>

            <View style={styles.plansContainer}>
              <TouchableOpacity
                style={[styles.planCard, styles.monthlyPlan]}
                onPress={() => handlePurchase(PRODUCTS.MONTHLY)}
              >
                <Text style={styles.planTitle}>Monthly</Text>
                <Text style={styles.price}>{monthlyProduct?.priceString || '$4.99'}</Text>
                <Text style={styles.period}>per month</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.planCard, styles.yearlyPlan]}
                onPress={() => handlePurchase(PRODUCTS.YEARLY)}
              >
                <View style={styles.saveBadge}>
                  <Text style={styles.saveText}>Save ~17%</Text>
                </View>
                <Text style={styles.planTitle}>Yearly</Text>
                <Text style={styles.price}>{yearlyProduct?.priceString || '$49.99'}</Text>
                <Text style={styles.period}>per year</Text>
                <Text style={styles.savings}>Two months free!</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={async () => {
                try {
                  await useSubscription().restorePurchases();
                  onClose();
                } catch (error) {
                  console.error('Restore failed:', error);
                }
              }}
            >
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollContent: {
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    paddingHorizontal: 20,
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  planCard: {
    width: '47%',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthlyPlan: {
    backgroundColor: '#F3F4F6',
  },
  yearlyPlan: {
    backgroundColor: '#EBF5FF',
    position: 'relative',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  period: {
    fontSize: 14,
    color: '#666',
  },
  savings: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 5,
    fontWeight: 'bold',
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  restoreButton: {
    padding: 10,
    alignItems: 'center',
  },
  restoreText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
