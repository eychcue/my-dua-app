// File: contexts/DuaContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dua } from '@/types/dua';
import { duaCategories } from '@/constants/DuaData';

export interface Sequence {
  id: string;
  name: string;
  duaIds: string[];
}

interface DuaContextType {
  duas: Dua[];
  sequences: Sequence[];
  readCounts: { [key: string]: number };
  addDua: (dua: Dua) => void;
  addSequence: (sequence: Sequence) => void;
  markDuaAsRead: (duaId: string) => void;
  getReadCount: (duaId: string) => number;
}

const DuaContext = createContext<DuaContextType | undefined>(undefined);

export const DuaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [duas, setDuas] = useState<Dua[]>(duaCategories.flatMap(category => category.duas));
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [readCounts, setReadCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Load read counts from AsyncStorage when the app starts
    const loadReadCounts = async () => {
      try {
        const storedCounts = await AsyncStorage.getItem('readCounts');
        if (storedCounts) {
          setReadCounts(JSON.parse(storedCounts));
        }
      } catch (error) {
        console.error('Failed to load read counts', error);
      }
    };
    loadReadCounts();
  }, []);

  const addDua = (dua: Dua) => {
    setDuas(prevDuas => [...prevDuas, dua]);
  };

  const addSequence = (sequence: Sequence) => {
    setSequences(prevSequences => [...prevSequences, sequence]);
  };

  const markDuaAsRead = async (duaId: string) => {
    const newReadCounts = {
      ...readCounts,
      [duaId]: (readCounts[duaId] || 0) + 1
    };
    setReadCounts(newReadCounts);

    // Save updated read counts to AsyncStorage
    try {
      await AsyncStorage.setItem('readCounts', JSON.stringify(newReadCounts));
    } catch (error) {
      console.error('Failed to save read count', error);
    }
  };

  const getReadCount = (duaId: string) => readCounts[duaId] || 0;

  return (
    <DuaContext.Provider value={{ duas, sequences, readCounts, addDua, addSequence, markDuaAsRead, getReadCount }}>
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
