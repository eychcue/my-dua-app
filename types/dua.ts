// File: types/dua.ts

export interface Dua {
  _id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  description?: string;
}

export interface DuaCategory {
  id: string;
  name: string;
  duas: Dua[];
}

export interface BackendDua {
  _id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  description: string;
}

export function convertBackendDua(backendDua: BackendDua): Dua {
  return {
    id: backendDua._id,
    title: backendDua.title,
    arabic: backendDua.arabic,
    transliteration: backendDua.transliteration,
    translation: backendDua.translation,
    description: backendDua.description,
  };
}
