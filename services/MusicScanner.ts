import { NativeModules } from 'react-native';

const { MusicScanner } = NativeModules;

export type Song = {
  title: string;
  artist: string;
  duration: number;
  uri: string;
  cover?: string; // base64 image
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
