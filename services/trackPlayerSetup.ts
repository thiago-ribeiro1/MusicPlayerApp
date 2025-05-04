import TrackPlayer, { Event, Track } from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setupPlayerIfNeeded() {
  const isSetup = await TrackPlayer.isServiceRunning();
  if (!isSetup) {
    await TrackPlayer.setupPlayer();
  }

  // Armazena a última música tocada (ao trocar de track)
  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async ({ nextTrack }) => {
    if (nextTrack !== null) {
      const track = await TrackPlayer.getTrack(nextTrack) as Track;
      await AsyncStorage.setItem('lastTrack', JSON.stringify(track));
    }
  });
}
