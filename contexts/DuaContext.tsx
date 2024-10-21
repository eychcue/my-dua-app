// File: contexts/DuaContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import {
  getDua,
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
  batchUpdateDeletionStatus,
  batchUpdateCollections,
} from '../api';
import { Dua, Collection } from '../types/dua';
import { cancelCollectionNotification, scheduleCollectionNotification, clearOrphanedNotifications } from '../utils/notificationHandler';
import NetInfo from '@react-native-community/netinfo';
import { getOfflineReads, addOfflineRead, clearOfflineReads,
  getOfflineArchiveActions,
  addOfflineArchiveAction,
  clearOfflineArchiveActions,
  getOfflineArchivedDuas,
  setOfflineArchivedDuas,
  getOfflineDeletedDuas,
  setOfflineDeletedDuas,
  addOfflineDeletionAction,
  getOfflineDeletionActions,
  clearOfflineDeletionActions,
  getOfflineDuas,
  setOfflineDuas,
  getOfflineCollections,
  setOfflineCollections,
  addOfflineCollectionAction,
  getOfflineCollectionActions,
  clearOfflineCollectionActions,
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
  const [deletedDuas, setDeletedDuas] = useState<Dua[]>([]);

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
      syncOfflineDeletionActions();
      syncOfflineCollectionActions();
    }
  }, [isOnline]);

  const syncOfflineCollectionActions = async () => {
    try {
      const offlineActions = await getOfflineCollectionActions();
      console.log('Raw offline actions:', JSON.stringify(offlineActions, null, 2));

      if (offlineActions.length > 0) {
        const sortedActions = offlineActions.sort((a, b) => a.timestamp - b.timestamp);
        console.log('Sorted actions:', JSON.stringify(sortedActions, null, 2));

        const finalActions = sortedActions.reduce((acc, action) => {
          const existingIndex = acc.findIndex(a =>
            a.collection._id === action.collection._id ||
            a.collection.name === action.collection.name
          );
          if (existingIndex !== -1) {
            if (action.type === 'delete') {
              acc[existingIndex] = action;
            } else if (action.type === 'update' || action.type === 'create') {
              acc[existingIndex] = {
                ...action,
                collection: {
                  ...acc[existingIndex].collection,
                  ...action.collection
                }
              };
            }
          } else {
            acc.push(action);
          }
          return acc;
        }, []);

        console.log('Final actions after merging:', JSON.stringify(finalActions, null, 2));

        const actionsForApi = finalActions.map(action => ({
          type: action.type,
          collection: {
            ...action.collection,
            _id: action.collection._id
          }
        }));

        console.log('Actions prepared for API:', JSON.stringify(actionsForApi, null, 2));

        await batchUpdateCollections(actionsForApi);

        // Handle notifications after batch update
        for (const action of actionsForApi) {
          if (action.type === 'delete') {
            await cancelCollectionNotification(action.collection._id);
          } else if (action.type === 'create' || action.type === 'update') {
            if (action.collection.notification_enabled && action.collection.scheduled_time) {
              await scheduleCollectionNotification(action.collection);
            } else {
              await cancelCollectionNotification(action.collection._id);
            }
          }
        }

        await clearOfflineCollectionActions();
        await fetchCollections();
      }
    } catch (error) {
      console.error('Failed to sync offline collection actions:', error);
    }
  };

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

  const syncOfflineDeletionActions = async () => {
    try {
      const offlineActions = await getOfflineDeletionActions();
      if (offlineActions.length > 0) {
        await batchUpdateDeletionStatus(offlineActions);
        await clearOfflineDeletionActions();
        // Refresh duas
        await fetchDuas();
      }
    } catch (error) {
      console.error('Failed to sync offline deletion actions:', error);
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
      let fetchedDuas = [];
      if (isOnline) {
        try {
          fetchedDuas = await getUserDuas();
          setDuas(fetchedDuas);
          await setOfflineDuas(fetchedDuas);
        } catch (error) {
          console.error('Failed to fetch duas from server', error);
          // Fetch from offline storage if server request fails
          fetchedDuas = await getOfflineDuas();
          setDuas(fetchedDuas);
        }
      } else {
        fetchedDuas = await getOfflineDuas();
        setDuas(fetchedDuas);
      }
    } catch (error) {
      console.error('Failed to fetch duas', error);
      setDuas([]); // Set to empty array if both online and offline fetch fail
    }
  };

  const fetchDua = useCallback(async (duaId: string) => {
    try {
      const fetchedDua = await getDua(duaId);
      setDuas(prevDuas => {
        const existingDuaIndex = prevDuas.findIndex(dua => dua._id === fetchedDua._id);
        if (existingDuaIndex !== -1) {
          // Update existing dua
          const updatedDuas = [...prevDuas];
          updatedDuas[existingDuaIndex] = fetchedDua;
          return updatedDuas;
        } else {
          // Add new dua
          return [...prevDuas, fetchedDua];
        }
      });
    } catch (error) {
      console.error('Failed to fetch dua', error);
    }
  }, []);

  const addDua = async (dua: Dua) => {
    try {
      if (isOnline) {
        await addDuaToUser(dua._id);
      }
      setDuas(prevDuas => {
        const updatedDuas = [...prevDuas, dua];
        setOfflineDuas(updatedDuas); // Update offline storage
        return updatedDuas;
      });
    } catch (error) {
      console.error('Failed to add dua', error);
    }
  };

  const fetchCollections = useCallback(async () => {
    try {
      let fetchedCollections = [];
      if (isOnline) {
        try {
          fetchedCollections = await getUserCollections();
          const processedCollections = fetchedCollections.map(collection => ({
            ...collection,
            _id: collection._id.toString(),
          }));
          setCollections(processedCollections);
          await setOfflineCollections(processedCollections);
        } catch (error) {
          console.error('Failed to fetch collections from server', error);
          // Fetch from offline storage if server request fails
          fetchedCollections = await getOfflineCollections();
          setCollections(fetchedCollections);
        }
      } else {
        fetchedCollections = await getOfflineCollections();
        setCollections(fetchedCollections);
      }
    } catch (error) {
      console.error('Failed to fetch collections', error);
      setCollections([]); // Set to empty array if both online and offline fetch fail
    }
  }, [isOnline]);


  const deleteCollection = async (collectionId: string) => {
    try {
      if (isOnline) {
        try {
          await deleteUserCollection(collectionId);
          await cancelCollectionNotification(collectionId);
        } catch (error) {
          console.error('Failed to delete collection on server:', error);
          await handleOfflineCollectionDeletion(collectionId);
        }
      } else {
        await handleOfflineCollectionDeletion(collectionId);
      }

      // Remove collection from local state
      setCollections(prev => prev.filter(collection => collection._id !== collectionId));

      // Clear orphaned notifications after deletion
      await clearOrphanedNotifications(isOnline);
    } catch (error) {
      console.error('Failed to delete collection:', error);
    }
  };

  const handleOfflineCollectionDeletion = async (collectionId: string) => {
    const collectionToDelete = collections.find(c => c._id === collectionId);
    if (collectionToDelete) {
      await addOfflineCollectionAction({
        type: 'delete',
        collection: collectionToDelete,
        timestamp: Date.now(),
      });

      // Update offline collections
      const updatedCollections = collections.filter(collection => collection._id !== collectionId);
      await setOfflineCollections(updatedCollections);

      // Cancel notification
      await cancelCollectionNotification(collectionId);
    }
  };


  const markAsRead = useCallback(async (duaId: string) => {
    try {
      if (isOnline) {
        try {
          const updatedCount = await markDuaAsRead(duaId);
          setReadCounts(prev => ({ ...prev, [duaId]: updatedCount }));
        } catch (error) {
          console.error('Failed to mark dua as read on server:', error);
          // Handle error by updating read count locally
          await addOfflineRead(duaId);
          setReadCounts(prev => ({ ...prev, [duaId]: (prev[duaId] || 0) + 1 }));
        }
      } else {
        // Offline mode: update read count locally
        await addOfflineRead(duaId);
        setReadCounts(prev => ({ ...prev, [duaId]: (prev[duaId] || 0) + 1 }));
      }
    } catch (error) {
      console.error('Failed to mark dua as read:', error);
    }
  }, [isOnline]);

  const batchMarkAsRead = async (duaIds: string[]) => {
    try {
      if (isOnline) {
        try {
          const updatedCounts = await batchMarkDuasAsRead(duaIds);
          setReadCounts(prev => ({ ...prev, ...updatedCounts }));
        } catch (error) {
          console.error('Failed to batch mark duas as read on server:', error);
          // Update read counts locally
          for (const duaId of duaIds) {
            await addOfflineRead(duaId);
            setReadCounts(prev => ({ ...prev, [duaId]: (prev[duaId] || 0) + 1 }));
          }
        }
      } else {
        // Offline mode: update read counts locally
        for (const duaId of duaIds) {
          await addOfflineRead(duaId);
          setReadCounts(prev => ({ ...prev, [duaId]: (prev[duaId] || 0) + 1 }));
        }
      }
    } catch (error) {
      console.error('Failed to batch mark duas as read:', error);
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
      const duaToRemove = duas.find(dua => dua._id === duaId);
      if (!duaToRemove) return;

      if (isOnline) {
        await removeDuaFromUser(duaId);
      } else {
        await addOfflineDeletionAction({ duaId, action: 'delete' });
      }

      setDuas(prevDuas => {
        const updatedDuas = prevDuas.filter(dua => dua._id !== duaId);
        setOfflineDuas(updatedDuas); // Update offline storage
        return updatedDuas;
      });

      setDeletedDuas(prevDeletedDuas => {
        const updatedDeletedDuas = [...prevDeletedDuas, duaToRemove];
        setOfflineDeletedDuas(updatedDeletedDuas);
        return updatedDeletedDuas;
      });

      // Update collections
      setCollections(prevCollections =>
        prevCollections.map(collection => ({
          ...collection,
          duaIds: collection.duaIds.filter(id => id !== duaId)
        }))
      );
    } catch (error) {
      console.error('Failed to remove dua', error);
    }
  };

  const undoRemoveDua = async (dua: Dua) => {
    try {
      if (isOnline) {
        await addDuaToUser(dua._id);
      } else {
        await addOfflineDeletionAction({ duaId: dua._id, action: 'undoDelete' });
      }

      setDuas(prevDuas => {
        if (prevDuas.some(d => d._id === dua._id)) {
          return prevDuas; // Dua already exists, don't add it again
        }
        const updatedDuas = [...prevDuas, dua];
        setOfflineDuas(updatedDuas); // Update offline storage
        return updatedDuas;
      });

      setDeletedDuas(prevDeletedDuas => {
        const updatedDeletedDuas = prevDeletedDuas.filter(d => d._id !== dua._id);
        setOfflineDeletedDuas(updatedDeletedDuas);
        return updatedDeletedDuas;
      });
    } catch (error) {
      console.error('Failed to undo remove dua', error);
    }
  };

  const addCollection = async (collection: Omit<Collection, '_id'>) => {
    try {
      if (isOnline) {
        try {
          // Try to create the collection on the server
          const newCollection = await createCollection(collection);
          setCollections(prev => [...prev, newCollection]);

          if (newCollection.notification_enabled && newCollection.scheduled_time) {
            await scheduleCollectionNotification(newCollection);
          }

          // Update offline storage
          await setOfflineCollections([...collections, newCollection]);
        } catch (error) {
          // If the API call fails, handle it as an offline creation
          console.error('Failed to add collection to server:', error);

          // Handle the error by creating the collection offline
          const tempId = `temp_${Date.now()}`;
          const newCollection = { ...collection, _id: tempId };

          // Add to local state
          setCollections(prev => [...prev, newCollection]);

          // Store the action to create this collection when back online
          await addOfflineCollectionAction({ type: 'create', collection: newCollection, timestamp: Date.now() });

          // Update offline storage
          await setOfflineCollections([...collections, newCollection]);

          // Schedule notification if enabled
          if (newCollection.notification_enabled && newCollection.scheduled_time) {
            await scheduleCollectionNotification(newCollection);
          }
        }
      } else {
        // Offline creation
        const tempId = `temp_${Date.now()}`;
        const newCollection = { ...collection, _id: tempId };

        // Add to local state
        setCollections(prev => [...prev, newCollection]);

        // Store the action to create this collection when back online
        await addOfflineCollectionAction({ type: 'create', collection: newCollection, timestamp: Date.now() });

        // Update offline storage
        await setOfflineCollections([...collections, newCollection]);

        // Schedule notification if enabled
        if (newCollection.notification_enabled && newCollection.scheduled_time) {
          await scheduleCollectionNotification(newCollection);
        }
      }
    } catch (error) {
      console.error('Failed to add collection', error);
    }
  };

  const updateCollection = async (updatedCollection: Collection) => {
    try {
      if (isOnline) {
        try {
          await updateUserCollection(updatedCollection);

          // Update local state and offline storage
          setCollections(prev =>
            prev.map(collection =>
              collection._id === updatedCollection._id ? updatedCollection : collection
            )
          );
          await setOfflineCollections(
            collections.map(collection =>
              collection._id === updatedCollection._id ? updatedCollection : collection
            )
          );

          // Schedule or cancel notification
          if (updatedCollection.notification_enabled && updatedCollection.scheduled_time) {
            await scheduleCollectionNotification(updatedCollection);
          } else {
            await cancelCollectionNotification(updatedCollection._id);
          }

        } catch (error) {
          console.error('Failed to update collection on server:', error);
          await handleOfflineCollectionUpdate(updatedCollection);
        }
      } else {
        await handleOfflineCollectionUpdate(updatedCollection);
      }
    } catch (error) {
      console.error('Failed to update collection:', error);
    }
  };

  const handleOfflineCollectionUpdate = async (updatedCollection: Collection) => {
    setCollections(prev =>
      prev.map(collection =>
        collection._id === updatedCollection._id ? updatedCollection : collection
      )
    );

    await addOfflineCollectionAction({
      type: 'update',
      collection: updatedCollection,
      timestamp: Date.now(),
    });

    await setOfflineCollections(
      collections.map(collection =>
        collection._id === updatedCollection._id ? updatedCollection : collection
      )
    );

    if (updatedCollection.notification_enabled && updatedCollection.scheduled_time) {
      await scheduleCollectionNotification(updatedCollection);
    } else {
      await cancelCollectionNotification(updatedCollection._id);
    }
  };


  const fetchArchivedDuas = async () => {
    try {
      let fetchedArchivedDuas = [];
      if (isOnline) {
        try {
          fetchedArchivedDuas = await getUserArchivedDuas();
          setArchivedDuas(fetchedArchivedDuas);
          await setOfflineArchivedDuas(fetchedArchivedDuas);
        } catch (error) {
          console.error('Failed to fetch archived duas from server', error);
          // Fetch from offline storage if server request fails
          fetchedArchivedDuas = await getOfflineArchivedDuas();
          setArchivedDuas(fetchedArchivedDuas);
        }
      } else {
        fetchedArchivedDuas = await getOfflineArchivedDuas();
        setArchivedDuas(fetchedArchivedDuas);
      }
    } catch (error) {
      console.error('Failed to fetch archived duas', error);
      setArchivedDuas([]); // Set to empty array if both online and offline fetch fail
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
      fetchDua,
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
      deletedDuas,
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
