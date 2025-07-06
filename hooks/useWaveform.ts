import {useEffect, useState} from 'react';
import {getWaveform} from '../services/Soundwave';

export function useWaveform(uri?: string | null) {
  const [waveform, setWaveform] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!uri) {
      setWaveform([]);
      return;
    }

    setLoading(true);
    getWaveform(uri)
      .then(data => {
        if (mounted) {
          setWaveform(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setWaveform([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [uri]);

  return {waveform, loading};
}
