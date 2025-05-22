import { create } from 'zustand';
import { getAllSongs, Song as NativeSong } from '../services/MusicScanner';

import type { SongType } from '../types';

type UseSongsType = {
  songs: SongType[];
  getSongs: () => Promise<SongType[] | false>;
};

export const useSongs = create<UseSongsType>(set => ({
  songs: [],
  getSongs: async () => {
    try {
      const nativeSongs = await getAllSongs();

      const mappedSongs: SongType[] = nativeSongs.map((song, index) => ({
        url: song.uri,
        title: song.title || 'Unknown',
        album: '', // pode ser adicionado no Kotlin depois
        artist: song.artist || 'Unknown',
        duration: song.duration || 0,
        genre: '', // pode ser adicionado no futuro
        cover: song.cover
          ? `data:image/png;base64,${song.cover.trim()}`
          : '',
      }));

      set({ songs: mappedSongs });
      return mappedSongs;
    } catch (error) {
      console.error('Erro ao carregar músicas:', error);
      return false;
    }
  },
}));
