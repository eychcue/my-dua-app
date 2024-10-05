// File: contexts/DuaContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getUserDuas, addDuaToUser } from '@/api';
import { Dua } from '@/types/dua';

interface DuaContextType {
  duas: Dua[];
  fetchDuas: () => Promise<void>;
  addDua: (dua: Dua) => Promise<void>;
}

const DuaContext = createContext<DuaContextType | undefined>(undefined);

export const DuaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [duas, setDuas] = useState<Dua[]>([]);

  const fetchDuas = async () => {
    try {
      const fetchedDuas = await getUserDuas();
      // Log any duas missing an _id
      fetchedDuas.forEach((dua, index) => {
        if (!dua._id) {
          console.warn(`Dua at index ${index} is missing an _id:`, dua);
        }
      });
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

  useEffect(() => {
    fetchDuas();
  }, []);

  return (
    <DuaContext.Provider value={{ duas, fetchDuas, addDua }}>
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
