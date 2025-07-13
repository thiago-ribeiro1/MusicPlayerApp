import {View, Text, Image, Pressable, StyleSheet} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  PlayIcon,
  PauseIcon,
  HeartIcon as FilledHeartIcon,
} from 'react-native-heroicons/solid';
import {HeartIcon as EmptyHeartIcon} from 'react-native-heroicons/outline';
import TrackPlayer, {
  usePlaybackState,
  State,
  useActiveTrack,
} from 'react-native-track-player';
import MarqueeView from 'react-native-marquee-view';
import type {SongType} from '../types';
import {useFavourties} from '../hooks/useFavourites';
import {scaleFont, scaleSize} from '../utils/scale';

const SongCard = ({
  song,
  index,
  allSongs,
}: {
  song: SongType;
  index: number;
  allSongs: SongType[];
}) => {
  const {favourites, setFavourites} = useFavourties();
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const [isManuallyPlaying, setIsManuallyPlaying] = useState(false);

  useEffect(() => {
    const isCurrent = song.url === activeTrack?.url;
    const isActuallyPlaying = playbackState.state === State.Playing;

    if (isCurrent && isActuallyPlaying) {
      setTimeout(() => setIsManuallyPlaying(false), 300);
    }
  }, [activeTrack?.url, playbackState.state]);

  const addToFavourites = useCallback(async () => {
    const newFavourites = [...favourites, {...song}];
    await setFavourites(newFavourites);
  }, [song, favourites]);

  const removeFromFavourites = useCallback(async () => {
    const newFavourites = favourites.filter(
      favourite => favourite.url !== song.url,
    );
    await setFavourites(newFavourites);
  }, [song, favourites]);

  const parseDuration = useCallback((value: number) => {
    const seconds = value / 1000;
    return `${Math.floor(seconds / 60)}:${Math.ceil(seconds % 60)
      .toString()
      .padStart(2, '0')}`;
  }, []);

  const handlePlay = useCallback(async () => {
    setIsManuallyPlaying(true);
    try {
      const index = allSongs.findIndex(s => s.url === song.url);
      if (index === -1) return;

      const currentQueue = await TrackPlayer.getQueue();
      const alreadyQueued = currentQueue.length === allSongs.length;

      if (!alreadyQueued) {
        await TrackPlayer.reset();
        await TrackPlayer.add(
          allSongs.map(s => ({
            id: s.id,
            url: s.url,
            title: s.title,
            artist: s.artist,
            artwork: s.cover || require('../assets/song-cover.png'),
            duration: s.duration,
          })),
        );
      }

      await TrackPlayer.skip(index);
      await TrackPlayer.play();
    } catch (error) {
      console.error('Erro ao tocar música:', error);
    }
  }, [allSongs, song]);

  const handlePause = useCallback(async () => {
    await TrackPlayer.pause();
    setIsManuallyPlaying(false);
  }, []);

  const isCurrent = song.url === activeTrack?.url;
  const isPlaying = playbackState.state === State.Playing;
  const showPauseIcon = isCurrent && (isPlaying || isManuallyPlaying);

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
        <Pressable
          onPress={
            favourites.some(f => f.url === song.url)
              ? removeFromFavourites
              : addToFavourites
          }>
          {favourites.some(f => f.url === song.url) ? (
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

export default SongCard;
