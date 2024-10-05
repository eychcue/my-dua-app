// File: constants/DuaData.ts

import { DuaCategory } from '@/types/dua';

export const duaCategories: DuaCategory[] = [
  {
    id: 'cat1',
    name: 'Morning Duas',
    duas: [
      {
        id: 'dua001',
        title: 'Dua for Waking Up',
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
        transliteration: "Alhamdu lillahil-lathee ahyana ba'da ma amatana wa-ilayhin-nushoor",
        translation: 'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.',
      },
      {
        id: 'dua002',
        title: 'Dua for Wearing Clothes',
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا (الثَّوْبَ) وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
        transliteration: "Alhamdu lillahil-lathee kasanee hatha (aththawba) warazaqaneehi min ghayri hawlin minnee wala quwwatin",
        translation: 'Praise is to Allah who has clothed me with this (garment) and provided it for me, with no power or might from myself.',
      },
    ],
  },
  {
    id: 'cat2',
    name: 'Evening Duas',
    duas: [
      {
        id: 'dua003',
        title: 'Dua Before Sleeping',
        arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        transliteration: 'Bismika Allahumma amootu wa ahya',
        translation: 'In Your name O Allah, I die and I live.',
      },
      {
        id: 'dua004',
        title: 'Dua for Protection at Night',
        arabic: 'اللَّهُمَّ بِاسْمِكَ أَحْيَا وَأَمُوتُ',
        transliteration: 'Allahumma bismika ahya wa amoot',
        translation: 'O Allah, in Your name I live and die.',
      },
    ],
  },
];
