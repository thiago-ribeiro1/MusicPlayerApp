import {NativeModules} from 'react-native';

const {Soundwave} = NativeModules;

export async function getWaveform(
  uri: string,
  bars: number,
  cacheKey: string,
): Promise<number[]> {
  try {
    if (!Soundwave?.getWaveform) {
      return [];
    }

    const result: number[] = await Soundwave.getWaveform(uri, bars, cacheKey);
    return Array.isArray(result) ? result : [];
  } catch (err) {
    console.error('Erro ao gerar soundwave:', err);
    return [];
  }
}
