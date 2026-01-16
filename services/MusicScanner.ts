import {NativeModules} from 'react-native';

const {MusicScanner} = NativeModules;

export type Song = {
  id: string;
  url: string;
  title: string;
  artist: string;
  duration: number;
  uri: string;
  cover?: string; // base64 image
  album?: string;
  folder?: string;
  trackNumber?: number;
  fileName?: string;
};

export async function getAllSongs(): Promise<Song[]> {
  try {
    const songs: Song[] = await MusicScanner.getAllSongs();
    return songs;
  } catch (error) {
    console.error('Erro ao buscar músicas:', error);
    return [];
  }
}

export async function getSongsPaginated(
  offset: number,
  limit: number,
): Promise<Song[]> {
  try {
    const songs: Song[] = await MusicScanner.getSongsPaginated(offset, limit);
    return songs;
  } catch (error) {
    console.error('Erro ao buscar músicas paginadas:', error);
    return [];
  }
}
