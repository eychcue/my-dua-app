// File: components/DuaDetails.tsx

import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Dimensions, View as RNView, Share } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Dua } from '@/types/dua';
import { useDua } from '@/contexts/DuaContext';
import { Ionicons } from '@expo/vector-icons';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  dua: Dua;
  onClose: () => void;
};

export default function DuaDetails({ dua, onClose }: Props) {
  const { markAsRead, readCounts, archiveDua, isOnline } = useDua();
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);

  const handleMarkAsRead = useCallback(async () => {
    if (isMarkingAsRead) return;

    setIsMarkingAsRead(true);
    await markAsRead(dua._id);
    if (!isOnline) {
      setShowOfflineIndicator(true);
      setTimeout(() => setShowOfflineIndicator(false), 2000);
    }
    setIsMarkingAsRead(false);
  }, [dua._id, markAsRead, isOnline, isMarkingAsRead]);

  const handleArchive = async () => {
    if (isOnline) {
      await archiveDua(dua._id);
      onClose();
    } else {
      // You might want to show a more persistent notification for this action
      alert("Archiving is not available offline. Please try again when you're back online.");
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `exp://exp.host/@theoneandonlyhq/my-dua-app?release-channel=default&dua=${dua._id}`;
      const result = await Share.share({
        message: `Check out this dua: ${shareUrl}`,
        url: shareUrl, // This will be used on iOS, ignored on Android
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared via ${result.activityType}`);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <RNView style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
        <Menu>
          <MenuTrigger>
            <Ionicons name="ellipsis-vertical" size={24} color="black" />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={handleArchive} text="Archive" />
            <MenuOption onSelect={handleShare} text="Share" />
          </MenuOptions>
        </Menu>
      </RNView>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{dua.title}</Text>
        <Text style={styles.readCount}>
          Read {readCounts[dua._id] || 0} times
          {!isOnline && showOfflineIndicator && " (Saved offline)"}
        </Text>
        <View style={styles.separator} />
        <Text style={styles.arabic}>{dua.arabic}</Text>
        <View style={styles.separator} />
        <Text style={styles.transliteration}>{dua.transliteration}</Text>
        <View style={styles.separator} />
        <Text style={styles.translation}>{dua.translation}</Text>
        {dua.description && (
          <>
            <View style={styles.separator} />
            <Text style={styles.description}>{dua.description}</Text>
          </>
        )}
        <TouchableOpacity
          style={[styles.readButton, isMarkingAsRead && styles.disabledButton]}
          onPress={handleMarkAsRead}
          disabled={isMarkingAsRead}
        >
          <Text style={styles.readButtonText}>
            {isMarkingAsRead ? 'Marking as Read...' : 'Mark as Read'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      {!isOnline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>Offline Mode</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollViewContent: {
    minHeight: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  arabic: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Arabic', // Make sure you have an appropriate Arabic font
  },
  transliteration: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  translation: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
  },
  separator: {
    height: 1,
    width: '80%',
    backgroundColor: '#CED0CE',
    marginVertical: 15,
  },
  readButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  readButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  offlineIndicator: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  offlineText: {
    color: 'white',
    fontSize: 12,
  },
});
