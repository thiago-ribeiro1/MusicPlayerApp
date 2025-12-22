import TrackPlayer, {
  Capability,
  RepeatMode,
  AppKilledPlaybackBehavior,
  Event,
} from 'react-native-track-player';
import type {RemoteDuckEvent} from 'react-native-track-player';

export async function setupTrackPlayerService() {
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      alwaysPauseOnInterruption: true,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Stop,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause],
    notificationCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
  });

  // tratar perda de foco de áudio (Instagram, YouTube, etc.)
  TrackPlayer.addEventListener(
    Event.RemoteDuck,
    async (event: RemoteDuckEvent) => {
      if (event.paused || event.permanent) {
        // Outro app pegou o foco de áudio → pausa a música
        await TrackPlayer.pause();
      }
      // sem auto-resume aqui; o usuário decide quando voltar a tocar
    },
  );

  await TrackPlayer.setRepeatMode(RepeatMode.Queue);
}
