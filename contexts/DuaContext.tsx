// File: contexts/DuaContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getUserDuas, addDuaToUser, createSequence, getUserSequences, deleteUserSequence, updateUserSequence, markDuaAsRead, batchMarkDuasAsRead, getReadCounts } from '../api';
import { Dua, Sequence } from '../types/dua';

interface DuaContextType {
  duas: Dua[];
  sequences: Sequence[];
  readCounts: { [key: string]: number };
  fetchDuas: () => Promise<void>;
  addDua: (dua: Dua) => Promise<void>;
  addSequence: (sequence: { name: string; duaIds: string[] }) => Promise<void>;
  fetchSequences: () => Promise<void>;
  deleteSequence: (sequenceId: string) => Promise<void>;
  updateSequence: (sequence: Sequence) => Promise<void>;
  markAsRead: (duaId: string) => Promise<void>;
  batchMarkAsRead: (duaIds: string[]) => Promise<void>;
  fetchReadCounts: () => Promise<void>;
}

const DuaContext = createContext<DuaContextType | undefined>(undefined);

export const DuaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [duas, setDuas] = useState<Dua[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [readCounts, setReadCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchDuas();
    fetchSequences();
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

  const addSequence = async (sequence: { name: string; duaIds: string[] }) => {
    try {
      const newSequence = await createSequence(sequence);
      setSequences(prevSequences => [...prevSequences, newSequence]);
    } catch (error) {
      console.error('Failed to create sequence', error);
    }
  };

  const fetchSequences = async () => {
    try {
      const fetchedSequences = await getUserSequences();
      setSequences(fetchedSequences);
    } catch (error) {
      console.error('Failed to fetch sequences', error);
    }
  };

  const deleteSequence = async (sequenceId: string) => {
    try {
      await deleteUserSequence(sequenceId);
      setSequences(prevSequences => prevSequences.filter(seq => seq._id !== sequenceId));
    } catch (error) {
      console.error('Failed to delete sequence', error);
    }
  };

  const updateSequence = async (sequence: Sequence) => {
    try {
      const updatedSequence = await updateUserSequence(sequence);
      setSequences(prevSequences =>
        prevSequences.map(seq => seq._id === updatedSequence._id ? updatedSequence : seq)
      );
    } catch (error) {
      console.error('Failed to update sequence', error);
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

  return (
    <DuaContext.Provider value={{
      duas,
      sequences,
      readCounts,
      fetchDuas,
      addDua,
      addSequence,
      fetchSequences,
      deleteSequence,
      updateSequence,
      markAsRead,
      batchMarkAsRead,
      fetchReadCounts,
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
