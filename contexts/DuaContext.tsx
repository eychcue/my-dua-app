// File: contexts/DuaContext.tsx

// contexts/DuaContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getUserDuas, addDuaToUser, createSequence, getUserSequences } from '../api';
import { Dua, Sequence } from '../types/dua';  // Ensure this path is correct

interface DuaContextType {
  duas: Dua[];
  sequences: Sequence[];
  fetchDuas: () => Promise<void>;
  addDua: (dua: Dua) => Promise<void>;
  addSequence: (sequence: { name: string; duaIds: string[] }) => Promise<void>;
  fetchSequences: () => Promise<void>;
}

const DuaContext = createContext<DuaContextType | undefined>(undefined);

export const DuaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [duas, setDuas] = useState<Dua[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);

  useEffect(() => {
    fetchDuas();
    fetchSequences();
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

  return (
    <DuaContext.Provider value={{ duas, sequences, fetchDuas, addDua, addSequence, fetchSequences }}>
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
