import {create} from 'zustand';
import {getSongsPaginated, Song as NativeSong} from '../services/MusicScanner';
import type {SongType} from '../types';
import {saveBase64ToFile} from '../services/saveBase64ToFile';

type UseSongsType = {
  songs: SongType[];
  offset: number;
  isLoading: boolean;
  loadMoreSongs: () => Promise<SongType[]>;
  resetSongs: () => void;
};

export const useSongs = create<UseSongsType>((set, get) => ({
  songs: [],
  offset: 0,
  isLoading: false,

  loadMoreSongs: async () => {
    const {offset, songs} = get();
    set({isLoading: true});

    const nativeSongs = await getSongsPaginated(offset, 10);

    // Salva as capas em disco
    const mapped = await Promise.all(
      nativeSongs.map(async song => {
        let coverPath = '';
        if (song.cover) {
          try {
            coverPath = await saveBase64ToFile(
              song.cover.trim(),
              `${song.id}_${Date.now()}`,
            ); // Salva como file://
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
          cover: coverPath, // Caminho do arquivo salvo
        };
      }),
    );

    set({
      songs: [...songs, ...mapped],
      offset: offset + 10,
      isLoading: false,
    });

    return mapped;
  },

  resetSongs: () => set({songs: [], offset: 0}),
}));
