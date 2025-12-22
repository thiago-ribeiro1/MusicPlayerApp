import {create} from 'zustand';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {SongType} from '../types';

type UseFavouritesType = {
  favourites: SongType[];
  setFavourites: (favourites: SongType[]) => Promise<void>;
  getFavourites: () => Promise<void>;
};

const ARTWORK_DIR = `${RNFS.DocumentDirectoryPath}/artwork`;

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9_\-]/g, '_');
}

async function ensureDir() {
  const exists = await RNFS.exists(ARTWORK_DIR);
  if (!exists) await RNFS.mkdir(ARTWORK_DIR);
}

async function ensurePersistentCover(song: SongType): Promise<SongType> {
  if (song.cover.startsWith('file://') && song.cover.includes('/artwork/')) {
    const p = song.cover.replace('file://', '');
    const ok = await RNFS.exists(p);
    return ok ? song : {...song, cover: ''};
  }

  if (!song.cover) return song;

  // verifica se já está no diretório persistente
  if (song.cover.startsWith('file://') && song.cover.includes('/artwork/'))
    return song;

  // se veio do cache, migra
  if (song.cover.startsWith('file://') && song.cover.includes('/cache/')) {
    const src = song.cover.replace('file://', '');
    const exists = await RNFS.exists(src);
    if (!exists) return {...song, cover: ''};

    await ensureDir();

    const fileName = `${sanitizeFileName(song.id)}.png`;
    const dest = `${ARTWORK_DIR}/${fileName}`;

    try {
      // Se já existe destino, mantém
      const destExists = await RNFS.exists(dest);
      if (!destExists) {
        await RNFS.copyFile(src, dest);
      }
      return {...song, cover: `file://${dest}`};
    } catch {
      return {...song, cover: ''};
    }
  }

  return song;
}

export const useFavourties = create<UseFavouritesType>(set => ({
  favourites: [],
  setFavourites: async favourites => {
    const fixed = await Promise.all(favourites.map(ensurePersistentCover));
    await AsyncStorage.setItem('favourites', JSON.stringify(fixed));
    set({favourites: fixed});
  },

  getFavourites: async () => {
    const storedFavourites = await AsyncStorage.getItem('favourites');
    if (storedFavourites) {
      const parsed: SongType[] = JSON.parse(storedFavourites);
      const fixed = await Promise.all(parsed.map(ensurePersistentCover));
      await AsyncStorage.setItem('favourites', JSON.stringify(fixed)); // migra e salva
      set({favourites: fixed});
    }
  },
}));
