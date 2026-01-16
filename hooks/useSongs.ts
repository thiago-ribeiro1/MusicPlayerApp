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

        const isMissing = (v?: string | null) => {
          if (!v) return true;
          const t = String(v).trim();
          return (
            t.length === 0 ||
            t.toLowerCase() === '<unknown>' ||
            t.toLowerCase() === 'unknown'
          );
        };

        const clean = (v?: string | null) => (v ? String(v).trim() : '');

        const safeAlbum = isMissing(song.album) ? 'Unknown' : clean(song.album);
        const safeArtist = isMissing(song.artist)
          ? 'Unknown Artist'
          : clean(song.artist);

        // title: prefer title válido; senão fileName; senão Unknown
        const safeTitle = !isMissing(song.title)
          ? clean(song.title)
          : !isMissing((song as any).fileName)
          ? clean((song as any).fileName)
          : 'Unknown';

        return {
          id: song.id,
          url: song.uri,
          title: safeTitle,
          album: safeAlbum,
          folder: song.folder ? song.folder : '',
          artist: safeArtist,
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
