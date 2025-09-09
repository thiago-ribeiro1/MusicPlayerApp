import {useEffect, useState} from 'react';
import {getWaveform} from '../services/Soundwave';

type Options = {bars?: number};

export function useWaveform(uri?: string | null, options: Options = {}) {
  const [waveform, setWaveform] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const bars = options.bars ?? 160;
  useEffect(() => {
    let mounted = true;

    if (!uri) {
      setWaveform([]);
      return;
    }

    setLoading(true);
    getWaveform(uri, bars)
      .then(data => {
        if (mounted) setWaveform(data);
      })
      .catch(() => {
        if (mounted) setWaveform([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [uri, bars]);

  return {waveform, loading};
}
