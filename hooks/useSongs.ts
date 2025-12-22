import {create} from 'zustand';
import {getSongsPaginated, Song as NativeSong} from '../services/MusicScanner';
import type {SongType} from '../types';
import {saveBase64ToFile} from '../services/saveBase64ToFile';

type UseSongsType = {
  songs: SongType[];
  offset: number;
  isLoading: boolean;
  limitExceeded: boolean;
  loadMoreSongs: () => Promise<SongType[]>;
  resetSongs: () => void;
};

export const useSongs = create<UseSongsType>((set, get) => ({
  songs: [],
  offset: 0,
  isLoading: false,
  limitExceeded: false,

  loadMoreSongs: async () => {
    const {offset, songs} = get();

    if (songs.length >= 100) {
      set({limitExceeded: true});
      return [];
    }

    set({isLoading: true});

    const nativeSongs = await getSongsPaginated(offset, 10);
    const remaining = 100 - songs.length;
    const sliced = nativeSongs.slice(0, remaining);

    const mapped = await Promise.all(
      sliced.map(async song => {
        let coverPath = '';
        if (song.cover) {
          try {
            coverPath = await saveBase64ToFile(song.cover.trim(), song.id);
          } catch (err) {
            console.warn(`Erro ao salvar capa da música ${song.title}:`, err);
          }
        }

        return {
          id: song.id,
          url: song.uri,
          title: song.title || 'Unknown',
          album: song.album || '',
          folder: song.folder || '',
          artist: song.artist || 'Unknown',
          duration: song.duration || 0,
          genre: '',
          cover: coverPath,
          trackNumber: song.trackNumber || 0,
        };
      }),
    );

    const newSongs = [...songs, ...mapped];

    set({
      songs: newSongs,
      offset: offset + 10,
      isLoading: false,
      limitExceeded: newSongs.length > 100,
    });

    return mapped;
  },

  resetSongs: () => set({songs: [], offset: 0, limitExceeded: false}),
}));
