// utils/orderByAlbum.ts
import type {SongType} from '../types';

export function orderSongsByAlbum(songs: SongType[]): SongType[] {
  const albums = songs.reduce((acc, song) => {
    const album = song.album || `single-${song.id}`; // singles separados
    if (!acc[album]) acc[album] = [];
    acc[album].push(song);
    return acc;
  }, {} as Record<string, SongType[]>);

  Object.keys(albums).forEach(album => {
    albums[album].sort((a, b) => {
      if (!a.trackNumber) return 1;
      if (!b.trackNumber) return -1;
      return a.trackNumber - b.trackNumber;
    });
  });

  const ordered: SongType[] = [];
  Object.values(albums).forEach(albumSongs => {
    ordered.push(...albumSongs);
  });

  return ordered;
}
