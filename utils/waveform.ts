import type {SongType} from '../types';

export function buildWaveformCacheKey(
  song?: SongType | null,
  bars: number = 95,
) {
  if (!song) return '';

  return [
    song.url,
    song.duration ?? 0,
    song.lastModified ?? 0,
    song.fileSize ?? 0,
    bars,
  ].join('|');
}
