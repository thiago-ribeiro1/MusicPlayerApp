import {View, Text, Image, Pressable, StyleSheet} from 'react-native';
import React, {useCallback} from 'react';
import {
  PlayIcon,
  PauseIcon,
  HeartIcon as FilledHeartIcon,
} from 'react-native-heroicons/solid';
import {HeartIcon as EmptyHeartIcon} from 'react-native-heroicons/outline';
import TrackPlayer from 'react-native-track-player';
import MarqueeView from 'react-native-marquee-view';
import type {SongType} from '../types';
import {scaleFont, scaleSize} from '../utils/scale';

// garantir file:// quando a capa vier em base64
import {saveBase64ToFile} from '../services/saveBase64ToFile';

type PlayContext = {
  groupKey: string;
  list: SongType[];
};

type SongCardProps = {
  // PROPS PRINCIPAIS PARA CADA ITEM
  song: SongType;
  index: number;
  allSongs: SongType[];
  playContext?: PlayContext;

  // PERFORMANCE (vem da tela; 1 assinatura por tela, não por item)
  activeUrl: string | null;
  isPlaying: boolean;

  // FAVORITOS (não depende de metadados; vem da tela para evitar re-render global)
  isFavourite: boolean;
  onToggleFavourite: (song: SongType) => Promise<void> | void;
};

const SongCard = ({
  song,
  index, // mantido (sem refatorar; pode estar sendo usado em telas)
  allSongs,
  playContext,
  activeUrl,
  isPlaying,
  isFavourite,
  onToggleFavourite,
}: SongCardProps) => {
  const parseDuration = useCallback((value: number) => {
    const seconds = value / 1000;
    return `${Math.floor(seconds / 60)}:${Math.ceil(seconds % 60)
      .toString()
      .padStart(2, '0')}`;
  }, []);

  // resolve artwork seguro (file:// quando base64, ou http/file, senão fallback)
  const buildTracks = useCallback(async (list: SongType[]) => {
    return Promise.all(
      list.map(async s => {
        let artworkSource: any = require('../assets/song-cover.png');
        const cover = s.cover;

        if (cover) {
          if (cover.startsWith('file://') || cover.startsWith('http')) {
            artworkSource = {uri: cover};
          } else if (cover.startsWith('data:image')) {
            const base64 = cover.replace(/^data:image\/\w+;base64,/, '');
            const uri = await saveBase64ToFile(base64, `${s.id || 'cover'}`);
            if (uri) artworkSource = {uri};
          } else {
            artworkSource = {uri: cover};
          }
        }

        return {
          id: s.id,
          url: s.url,
          title: s.title,
          artist: s.artist,
          artwork: artworkSource,
          duration: s.duration,
        };
      }),
    );
  }, []);

  const handlePlay = useCallback(async () => {
    try {
      const targetList = playContext?.list ?? allSongs;

      const idx = targetList.findIndex(s => s.url === song.url);
      if (idx === -1) return;

      // Lista com 1 música — fila mínima limpa
      if (targetList.length === 1) {
        await TrackPlayer.reset();
        const tracks = await buildTracks([song]);
        await TrackPlayer.add(tracks);
        await TrackPlayer.play();
        return;
      }

      // Verifica fila atual
      const currentQueue = await TrackPlayer.getQueue();

      // Compara identidade/ordem por URL (não só length)
      const sameLength = currentQueue.length === targetList.length;
      let sameIdentity = false;

      if (sameLength) {
        const currentUrls = currentQueue.map(t => t.url);
        const targetUrls = targetList.map(t => t.url);
        sameIdentity = currentUrls.every((u, i) => u === targetUrls[i]);
      }

      if (!sameLength || !sameIdentity) {
        await TrackPlayer.reset();
        const tracks = await buildTracks(targetList);
        await TrackPlayer.add(tracks);
      }

      await TrackPlayer.skip(idx);
      await TrackPlayer.play();
    } catch (error) {
      console.error('Erro ao tocar música:', error);
    }
  }, [allSongs, song, playContext, buildTracks]);

  const handlePause = useCallback(async () => {
    await TrackPlayer.pause();
  }, []);

  // PADRAO UNICO (sem timers, sem estado intermediario)
  const isCurrent = song.url === activeUrl;
  const showPauseIcon = isCurrent && isPlaying;

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.coverContainer}>
          <Image
            source={
              song.cover
                ? {uri: song.cover}
                : require('../assets/song-cover.png')
            }
            style={styles.cover}
            resizeMode="cover"
          />
        </View>
        <View style={styles.textContainer}>
          <MarqueeView style={styles.marquee}>
            <Text style={styles.title}>{song.title}</Text>
          </MarqueeView>
          <Text numberOfLines={2} style={styles.subtitle}>
            {song.artist !== '<unknown>' ? song.artist : 'Unknown'} /{' '}
            {parseDuration(song.duration)}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Pressable onPress={() => onToggleFavourite(song)}>
          {isFavourite ? (
            <FilledHeartIcon
              color="white"
              size={scaleSize(22)}
              fill="#40B0EB"
            />
          ) : (
            <EmptyHeartIcon color="white" size={scaleSize(22)} />
          )}
        </Pressable>

        <Pressable
          style={[styles.playButton, {backgroundColor: '#1684D9'}]}
          onPress={showPauseIcon ? handlePause : handlePlay}>
          {showPauseIcon ? (
            <PauseIcon color="white" size={scaleSize(24)} />
          ) : (
            <PlayIcon color="white" size={scaleSize(24)} />
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scaleSize(16),
    paddingHorizontal: scaleSize(8),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(16),
  },
  coverContainer: {
    width: scaleSize(64),
    height: scaleSize(64),
    borderRadius: scaleSize(12),
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flexDirection: 'column',
    gap: scaleSize(4),
    maxWidth: scaleSize(160),
  },
  marquee: {
    width: scaleSize(155),
  },
  title: {
    fontSize: scaleFont(14),
    color: 'white',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: scaleFont(12),
    color: '#D1D5DB',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(12),
  },
  playButton: {
    borderRadius: 999,
    padding: scaleSize(8),
  },
});

// PERFORMANCE: memo para render previsivel
export default React.memo(SongCard, (prev, next) => {
  return (
    prev.song.url === next.song.url &&
    prev.song.title === next.song.title &&
    prev.song.artist === next.song.artist &&
    prev.song.cover === next.song.cover &&
    prev.activeUrl === next.activeUrl &&
    prev.isPlaying === next.isPlaying &&
    prev.isFavourite === next.isFavourite
  );
});
