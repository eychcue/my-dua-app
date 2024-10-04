// File: contexts/DuaContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';
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
  addDua: (dua: Dua) => void;
  addSequence: (sequence: Sequence) => void;
}

const DuaContext = createContext<DuaContextType | undefined>(undefined);

export const DuaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [duas, setDuas] = useState<Dua[]>(duaCategories.flatMap(category => category.duas));
  const [sequences, setSequences] = useState<Sequence[]>([]);

  const addDua = (dua: Dua) => {
    setDuas(prevDuas => [...prevDuas, dua]);
  };

  const addSequence = (sequence: Sequence) => {
    setSequences(prevSequences => [...prevSequences, sequence]);
  };

  return (
    <DuaContext.Provider value={{ duas, sequences, addDua, addSequence }}>
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
