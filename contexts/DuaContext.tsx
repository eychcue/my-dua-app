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
  getReadCounts,
  removeDuaFromUser
} from '../api';
import { Dua, Collection } from '../types/dua';

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
  removeDua: (duaId: string) => Promise<void>; // Add this
  undoRemoveDua: (dua: Dua) => Promise<void>; // Add this
}

const DuaContext = createContext<DuaContextType | undefined>(undefined);

export const DuaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [duas, setDuas] = useState<Dua[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [readCounts, setReadCounts] = useState<{ [key: string]: number }>({});

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

  const addCollection = async (collection: { name: string; duaIds: string[] }) => {
    try {
      const newCollection = await createCollection(collection);
      setCollections(prevCollections => [...prevCollections, newCollection]);
    } catch (error) {
      console.error('Failed to create collection', error);
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
      setCollections(prevCollections => prevCollections.filter(seq => seq._id !== collectionId));
    } catch (error) {
      console.error('Failed to delete collection', error);
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

  const markAsRead = async (duaId: string) => {
    try {
      const updatedCount = await markDuaAsRead(duaId);
      setReadCounts(prev => ({ ...prev, [duaId]: updatedCount }));
    } catch (error) {
      console.error('Failed to mark dua as read', error);
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
