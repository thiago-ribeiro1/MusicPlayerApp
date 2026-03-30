import {useEffect, useState} from 'react';
import {getWaveform} from '../services/Soundwave';

type Options = {
  bars?: number;
  cacheKey?: string;
};

export function useWaveform(uri?: string | null, options: Options = {}) {
  const [waveform, setWaveform] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const bars = options.bars ?? 95;
  const cacheKey = options.cacheKey ?? '';

  useEffect(() => {
    let mounted = true;

    if (!uri || !cacheKey) {
      setWaveform([]);
      setLoading(false);
      return;
    }

    setWaveform([]);
    setLoading(true);

    setLoading(true);

    getWaveform(uri, bars, cacheKey)
      .then(data => {
        if (!mounted) return;
        setWaveform(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setWaveform([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [uri, bars, cacheKey]);

  return {waveform, loading};
}
