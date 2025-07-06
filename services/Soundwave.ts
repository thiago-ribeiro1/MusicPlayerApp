import {NativeModules} from 'react-native';

const {Soundwave} = NativeModules;

export async function getWaveform(uri: string): Promise<number[]> {
  try {
    const result: number[] = await Soundwave.getWaveform(uri);
    return result;
  } catch (err) {
    console.error('Erro ao gerar soundwave:', err);
    return [];
  }
}
