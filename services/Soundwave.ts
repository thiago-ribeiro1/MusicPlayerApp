import {NativeModules} from 'react-native';
const {Soundwave} = NativeModules;

/**
 * Pede o waveform com N barras (fallback pro método antigo se não existir).
 */
export async function getWaveform(
  uri: string,
  bars: number = 160,
): Promise<number[]> {
  try {
    if (Soundwave?.getWaveformWithBars) {
      const result: number[] = await Soundwave.getWaveformWithBars(
        uri,
        bars,
        false,
      );
      return result;
    }
    // fallback p/ versões antigas do módulo (sem parâmetro bars)
    const result: number[] = await Soundwave.getWaveform(uri);
    return result;
  } catch (err) {
    console.error('Erro ao gerar soundwave:', err);
    return [];
  }
}
