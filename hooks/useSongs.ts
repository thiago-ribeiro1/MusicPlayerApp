import {create} from 'zustand';
import {
  getAll,
  SortSongFields,
  SortSongOrder,
} from 'react-native-get-music-files';

import type {SongType} from '../types';

type UseSongsType = {
  songs: SongType[];
  getSongs: () => Promise<SongType[] | false>;
};

export const useSongs = create<UseSongsType>(set => ({
  songs: [],
  getSongs: async () => {
    const songsOrError = await getAll({
      limit: 55,
      coverQuality: 100, // melhor qualidade da capa
      minSongDuration: 10000, // só músicas com mais de 10 segundos
      sortBy: SortSongFields.TITLE,
      sortOrder: SortSongOrder.ASC, // ordem crescente (opcional)
    });

    if (typeof songsOrError === 'string') {
      console.error('Error fetching songs:', songsOrError);
      return false;
    }

    set({songs: songsOrError});
    return songsOrError;
  },
}));
