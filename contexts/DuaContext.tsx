// File: contexts/DuaContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import {
  getUserDuas,
  addDuaToUser,
  createCollection,
  getUserCollections,
  deleteUserCollection,
  updateUserCollection,
  markDuaAsRead,
  batchMarkDuasAsRead,
  batchUpdateReadCount,
  getReadCounts,
  removeDuaFromUser,
  archiveDua,
  unarchiveDua,
  getUserArchivedDuas,
  batchUpdateArchiveStatus,
} from '../api';
import { Dua, Collection } from '../types/dua';
import { cancelCollectionNotification } from '../utils/notificationHandler';
import NetInfo from '@react-native-community/netinfo';
import { getOfflineReads, addOfflineRead, clearOfflineReads,
  getOfflineArchiveActions,
  addOfflineArchiveAction,
  clearOfflineArchiveActions,
  getOfflineArchivedDuas,
  setOfflineArchivedDuas,
 } from '../utils/offlineStorage';

interface DuaContextType {
  duas: Dua[];
  collections: Collection[];
  readCounts: { [key: string]: number };
  fetchDuas: () => Promise<void>;
  addDua: (dua: Dua) => Promise<void>;
  addCollection: (collection: { name: string; duaIds: string[] }) => Promise<void>;
  fetchCollections: () => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;
  updateCollection: (collection: Collection) => Promise<void>;
  markAsRead: (duaId: string) => Promise<void>;
  batchMarkAsRead: (duaIds: string[]) => Promise<void>;
  fetchReadCounts: () => Promise<void>;
  removeDua: (duaId: string) => Promise<void>;
  undoRemoveDua: (dua: Dua) => Promise<void>;
  archivedDuas: Dua[];
  archiveDua: (duaId: string) => Promise<void>;
  unarchiveDua: (duaId: string) => Promise<void>;
  fetchArchivedDuas: () => Promise<void>;
}

const DuaContext = createContext<DuaContextType | undefined>(undefined);

export const DuaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [duas, setDuas] = useState<Dua[]>([]);
  const [archivedDuas, setArchivedDuas] = useState<Dua[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [readCounts, setReadCounts] = useState<{ [key: string]: number }>({});
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncOfflineReads();
      syncOfflineArchiveActions();
    }
  }, [isOnline]);

  const syncOfflineReads = async () => {
    try {
      const offlineReads = await getOfflineReads();
      if (offlineReads.length > 0) {
        const updates = offlineReads.reduce((acc, { duaId, count }) => {
          acc[duaId] = (acc[duaId] || 0) + count;
          return acc;
        }, {} as Record<string, number>);

        const updatedCounts = await batchUpdateReadCount(updates);
        setReadCounts(prev => ({ ...prev, ...updatedCounts }));
        await clearOfflineReads();
      }
    } catch (error) {
      console.error('Failed to sync offline reads:', error);
    }
  };

  const syncOfflineArchiveActions = async () => {
    try {
      const offlineActions = await getOfflineArchiveActions();
      if (offlineActions.length > 0) {
        await batchUpdateArchiveStatus(offlineActions);
        await clearOfflineArchiveActions();
        // Refresh duas and archived duas
        await fetchDuas();
        await fetchArchivedDuas();
      }
    } catch (error) {
      console.error('Failed to sync offline archive actions:', error);
      // Add more detailed error logging here
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    }
  };

  const archiveDuaHandler = async (duaId: string) => {
    try {
      if (isOnline) {
        await archiveDua(duaId);
      } else {
        await addOfflineArchiveAction(duaId, 'archive');
      }
      const archivedDua = duas.find(dua => dua._id === duaId);
      if (archivedDua) {
        setArchivedDuas(prevArchivedDuas => {
          const updatedArchivedDuas = [...prevArchivedDuas, archivedDua];
          // Update local storage
          setOfflineArchivedDuas(updatedArchivedDuas);
          return updatedArchivedDuas;
        });
        setDuas(prevDuas => prevDuas.filter(dua => dua._id !== duaId));
      }
      // Update collections
      setCollections(prevCollections =>
        prevCollections.map(collection => ({
          ...collection,
          duaIds: collection.duaIds.filter(id => id !== duaId)
        }))
      );
    } catch (error) {
      console.error('Failed to archive dua', error);
    }
  };

  const unarchiveDuaHandler = async (duaId: string) => {
    try {
      if (isOnline) {
        await unarchiveDua(duaId);
      } else {
        await addOfflineArchiveAction(duaId, 'unarchive');
      }
      const unarchivedDua = archivedDuas.find(dua => dua._id === duaId);
      if (unarchivedDua) {
        setDuas(prevDuas => [...prevDuas, unarchivedDua]);
        setArchivedDuas(prevArchivedDuas => {
          const updatedArchivedDuas = prevArchivedDuas.filter(dua => dua._id !== duaId);
          // Update local storage
          setOfflineArchivedDuas(updatedArchivedDuas);
          return updatedArchivedDuas;
        });
      }
    } catch (error) {
      console.error('Failed to unarchive dua', error);
    }
  };

  useEffect(() => {
    fetchDuas();
    fetchCollections();
    fetchReadCounts();
  }, []);

  const fetchDuas = async () => {
    try {
      const fetchedDuas = await getUserDuas();
      setDuas(fetchedDuas);
    } catch (error) {
      console.error('Failed to fetch duas', error);
    }
  };

  const addDua = async (dua: Dua) => {
    try {
      await addDuaToUser(dua._id);
      setDuas(prevDuas => [...prevDuas, dua]);
    } catch (error) {
      console.error('Failed to add dua', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const fetchedCollections = await getUserCollections();
      setCollections(fetchedCollections);
    } catch (error) {
      console.error('Failed to fetch collections', error);
    }
  };

  const deleteCollection = async (collectionId: string) => {
    try {
      await deleteUserCollection(collectionId);
      await cancelCollectionNotification(collectionId);
      setCollections(prevCollections => prevCollections.filter(seq => seq._id !== collectionId));
    } catch (error) {
      console.error('Failed to delete collection', error);
    }
  };

  const markAsRead = async (duaId: string) => {
    try {
      if (isOnline) {
        const updatedCount = await markDuaAsRead(duaId);
        setReadCounts(prev => ({ ...prev, [duaId]: updatedCount }));
      } else {
        await addOfflineRead(duaId);
        setReadCounts(prev => ({ ...prev, [duaId]: (prev[duaId] || 0) + 1 }));
      }
    } catch (error) {
      console.error('Failed to mark dua as read:', error);
    }
  };

  const batchMarkAsRead = async (duaIds: string[]) => {
    try {
      const updatedCounts = await batchMarkDuasAsRead(duaIds);
      setReadCounts(prev => ({ ...prev, ...updatedCounts }));
    } catch (error) {
      console.error('Failed to batch mark duas as read', error);
    }
  };

  const fetchReadCounts = async () => {
    try {
      const counts = await getReadCounts();
      setReadCounts(counts);
    } catch (error) {
      console.error('Failed to fetch read counts', error);
    }
  };

  const incrementReadCount = async (duaId: string) => {
    try {
      const updatedCount = await updateReadCount(duaId);
      setReadCounts(prevCounts => ({
        ...prevCounts,
        [duaId]: updatedCount
      }));
    } catch (error) {
      console.error('Failed to increment read count', error);
    }
  };

  const removeDua = async (duaId: string) => {
    try {
      await removeDuaFromUser(duaId);
      setDuas(prevDuas => prevDuas.filter(dua => dua._id !== duaId));

      // Fetch and update collections after removing dua
      const updatedCollections = await getUserCollections();
      setCollections(updatedCollections);
    } catch (error) {
      console.error('Failed to remove dua', error);
      // If the API call fails, we should add the dua back to the local state
      const removedDua = duas.find(dua => dua._id === duaId);
      if (removedDua) {
        setDuas(prevDuas => [...prevDuas, removedDua]);
      }
    }
  };

  const undoRemoveDua = async (dua: Dua) => {
    try {
      await addDuaToUser(dua._id);
      setDuas(prevDuas => {
        if (prevDuas.some(d => d._id === dua._id)) {
          return prevDuas; // Dua already exists, don't add it again
        }
        return [...prevDuas, dua];
      });
    } catch (error) {
      console.error('Failed to undo remove dua', error);
    }
  };

  const addCollection = async (collection: {
    name: string;
    duaIds: string[];
    scheduled_time: string | null;
    notification_enabled: boolean
  }): Promise<Collection> => {
    try {
      const newCollection = await createCollection(collection);
      setCollections(prevCollections => [...prevCollections, newCollection]);
      return newCollection;
    } catch (error) {
      console.error('Failed to create collection', error);
      throw error;
    }
  };

  const updateCollection = async (collection: Collection) => {
    try {
      const updatedCollection = await updateUserCollection(collection);
      setCollections(prevCollections =>
        prevCollections.map(seq => seq._id === updatedCollection._id ? updatedCollection : seq)
      );
    } catch (error) {
      console.error('Failed to update collection', error);
    }
  };

  const fetchArchivedDuas = async () => {
    try {
      if (isOnline) {
        const fetchedArchivedDuas = await getUserArchivedDuas();
        setArchivedDuas(fetchedArchivedDuas);
        // Store fetched archived duas locally for offline access
        await setOfflineArchivedDuas(fetchedArchivedDuas);
      } else {
        // If offline, get archived duas from local storage
        const offlineArchivedDuas = await getOfflineArchivedDuas();
        setArchivedDuas(offlineArchivedDuas);
      }
    } catch (error) {
      console.error('Failed to fetch archived duas', error);
    }
  };

  useEffect(() => {
    fetchArchivedDuas();
  }, []); // Fetch archived duas when the component mounts


  return (
    <DuaContext.Provider value={{
      duas,
      collections,
      readCounts,
      fetchDuas,
      addDua,
      addCollection,
      fetchCollections,
      deleteCollection,
      updateCollection,
      markAsRead,
      batchMarkAsRead,
      fetchReadCounts,
      removeDua,
      undoRemoveDua,
      archivedDuas,
      archiveDua: archiveDuaHandler,
      unarchiveDua: unarchiveDuaHandler,
      fetchArchivedDuas,
      isOnline,
    }}>
      {children}
    </DuaContext.Provider>
  );
};

export const useDua = () => {
  const context = useContext(DuaContext);
  if (context === undefined) {
    throw new Error('useDua must be used within a DuaProvider');
  }
  return context;
};
