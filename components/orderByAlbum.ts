import {SongType} from '../types';

export function getOrderedSongsByAlbum(songs: SongType[]): SongType[] {
  const albums = songs.reduce((acc, song) => {
    if (song.album) {
      if (!acc[song.album]) acc[song.album] = [];
      acc[song.album].push(song);
    }
    return acc;
  }, {} as Record<string, SongType[]>);

  Object.keys(albums).forEach(album => {
    albums[album].sort((a, b) => {
      if (!a.trackNumber) return 1;
      if (!b.trackNumber) return -1;
      return a.trackNumber - b.trackNumber;
    });
  });

  return Object.entries(albums)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .flatMap(([_, songs]) => songs);
}
