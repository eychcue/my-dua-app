export interface Dua {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
}

export interface DuaCategory {
  id: string;
  name: string;
  duas: Dua[];
}
