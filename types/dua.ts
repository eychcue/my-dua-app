// File: types/dua.ts

export interface Dua {
  _id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  description?: string;
}

export interface Collection {
  _id: string;
  device_id: string;
  name: string;
  duaIds: string[];
  scheduled_time: string | null;
  notification_enabled: boolean;
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
    _id: backendDua._id,
    title: backendDua.title,
    arabic: backendDua.arabic,
    transliteration: backendDua.transliteration,
    translation: backendDua.translation,
    description: backendDua.description,
  };
}
