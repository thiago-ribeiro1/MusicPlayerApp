import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Dimensions,
  StatusBar,
  StyleSheet,
  ScrollView,
} from 'react-native';
import TrackPlayer, {
  useActiveTrack,
  usePlaybackState,
  State,
  useProgress,
  RepeatMode,
} from 'react-native-track-player';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import type {SongType} from '../types';
import Wrapper from '../components/Wrapper';
import {useSongs} from '../hooks/useSongs';
import {useWaveform} from '../hooks/useWaveform';
import {FontsStyle} from '../styles/FontsStyle';
import GoBackButton from '../components/GoBackButton';
import {scaleSize} from '../utils/scale';
import {AutoMarqueeTitle} from '../components/AutoMarqueeTitle';
import {buildWaveformCacheKey} from '../utils/waveform';

const {width} = Dimensions.get('window');

const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_W = (SCREEN_WIDTH * 11) / 12; // largura Tailwind w-11/12

const SCREEN_HEIGHT = Dimensions.get('window').height;
const IS_TABLET = SCREEN_HEIGHT > 900;
const COVER_SIZE = IS_TABLET ? scaleSize(150) : scaleSize(260); // se for tablet usa 150, se não 260

// Ajustes responsivos
const GAP_MIN = scaleSize(1);
const GAP_MAX = scaleSize(6);
const BAR_MIN = scaleSize(1);
const BAR_MAX = scaleSize(3);
const BAR_THIN = scaleSize(2);
const GAP = scaleSize(2);

const SongScreen = () => {
  const {songs} = useSongs();
  const activeTrack = useActiveTrack() as SongType;
  const playbackState = usePlaybackState();
  const progress = useProgress();

  const currentSong = songs.find(
    s => s.url === activeTrack?.url || s.url === activeTrack?.id,
  );

  const [localTrack, setLocalTrack] = useState<SongType | null>(null);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false);
  const [isSwappingQueue, setIsSwappingQueue] = useState(false);

  const track = useMemo(() => {
    if (isSwappingQueue && localTrack) return localTrack;
    return activeTrack || localTrack;
  }, [activeTrack, localTrack, isSwappingQueue]);

  const TARGET_BARS = 95;
  const waveformSource = currentSong ?? track;
  const waveformCacheKey = buildWaveformCacheKey(waveformSource, TARGET_BARS);

  const {waveform, loading} = useWaveform(track?.url, {
    bars: TARGET_BARS,
    cacheKey: waveformCacheKey,
  });

  const handlePlay = useCallback(async () => {
    await TrackPlayer.play();
  }, []);

  const handlePause = useCallback(async () => {
    await TrackPlayer.pause();
  }, []);

  const handleSkipToNext = useCallback(async () => {
    const currentTrack = await TrackPlayer.getActiveTrack();

    if (shuffleMode) {
      const remainingSongs = songs.filter(
        song => song.url !== currentTrack?.url,
      );
      const next =
        remainingSongs[Math.floor(Math.random() * remainingSongs.length)];

      if (next) {
        const index = songs.findIndex(song => song.url === next.url);
        if (index !== -1) {
          await TrackPlayer.skip(index);
          await TrackPlayer.play();
        }
      }
    } else {
      await TrackPlayer.skipToNext().catch(() => {});
      await TrackPlayer.play();
    }
  }, [shuffleMode, songs]);

  const handleSkipToPrevious = useCallback(async () => {
    const currentTrack = await TrackPlayer.getActiveTrack();

    if (shuffleMode) {
      const remainingSongs = songs.filter(
        song => song.url !== currentTrack?.url,
      );
      const prev =
        remainingSongs[Math.floor(Math.random() * remainingSongs.length)];

      if (prev) {
        const index = songs.findIndex(song => song.url === prev.url);
        if (index !== -1) {
          await TrackPlayer.skip(index);
          await TrackPlayer.play();
        }
      }
    } else {
      await TrackPlayer.skipToPrevious().catch(() => {});
      await TrackPlayer.play();
    }
  }, [shuffleMode, songs]);

  const toggleShuffle = useCallback(() => {
    setShuffleMode(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(async () => {
    const newMode = repeatMode ? RepeatMode.Off : RepeatMode.Track;
    await TrackPlayer.setRepeatMode(newMode);
    setRepeatMode(!repeatMode);
  }, [repeatMode]);

  const parseDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  useEffect(() => {
    if (localTrack && activeTrack) {
      const timeout = setTimeout(() => setLocalTrack(null), 2000);
      return () => clearTimeout(timeout);
    }
  }, [activeTrack, localTrack]);

  return (
    <View style={[tw`flex-1 w-full h-full`, {backgroundColor: '#000'}]}>
      {track ? (
        <>
          <Image
            source={
              track?.cover
                ? {uri: track.cover}
                : currentSong?.cover
                ? {uri: currentSong.cover}
                : require('../assets/song-cover.png')
            }
            style={tw`absolute w-full h-full`}
            blurRadius={40}
            resizeMode="cover"
          />

          <View style={tw`absolute w-full h-full bg-black/30`} />
          <Wrapper backgroundColor="transparent">
            <StatusBar
              backgroundColor="transparent"
              barStyle="light-content"
              translucent
            />
            <View style={{position: 'absolute', top: 48, left: 20, zIndex: 10}}>
              <GoBackButton />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              overScrollMode="always"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                tw`items-center justify-start pb-8`,
                {marginTop: IS_TABLET ? 16 : 112}, // 112 = mt-28 em px
              ]}>
              <View style={styles.coverWrapper}>
                <Image
                  source={
                    track?.cover
                      ? {uri: track.cover}
                      : currentSong?.cover
                      ? {uri: currentSong.cover}
                      : require('../assets/song-cover.png')
                  }
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              </View>

              <AutoMarqueeTitle
                title={track.title}
                textStyle={[FontsStyle.musicTitle, {textAlign: 'center'}]}
              />

              <Text style={tw`text-gray-400 text-base mb-6 text-center`}>
                {track.artist !== '<unknown>' ? track.artist : 'Unknown Artist'}
              </Text>

              <View style={tw`flex-row items-end h-16 w-11/12 justify-center`}>
                {(() => {
                  // barras visuais soundwave
                  const loadingWave = Array.from(
                    {length: TARGET_BARS},
                    () => 0.035,
                  );
                  const fallbackWave = Array.from(
                    {length: TARGET_BARS},
                    () => 0.12,
                  );

                  const isRealWaveReady = waveform.length === TARGET_BARS;
                  const wave = isRealWaveReady
                    ? waveform
                    : loading
                    ? loadingWave
                    : fallbackWave;
                  const n = wave.length || 1;

                  // Tenta manter barra fina e ajustar gap
                  let barWidth = BAR_THIN;
                  let gap = n > 1 ? (CONTAINER_W - barWidth * n) / (n - 1) : 0;

                  if (!(gap >= GAP_MIN && gap <= GAP_MAX)) {
                    gap = Math.max(GAP_MIN, Math.min(GAP_MAX, gap));
                    const totalGaps = gap * Math.max(0, n - 1);
                    const widthForBars = Math.max(0, CONTAINER_W - totalGaps);
                    barWidth = n > 0 ? Math.floor(widthForBars / n) : BAR_THIN;
                    barWidth = Math.max(BAR_MIN, Math.min(BAR_MAX, barWidth));
                  }

                  return wave.map((value, index) => {
                    const isPlayed =
                      index <
                      ((progress.position || 0) / (progress.duration || 1)) * n;

                    const goTo = ((index + 0.5) / n) * (progress.duration || 0);

                    const baseHeight = loading ? scaleSize(6) : scaleSize(20);
                    const extraHeight = loading
                      ? value * scaleSize(10)
                      : value * scaleSize(40);

                    return (
                      <Pressable
                        key={index}
                        onPress={() => TrackPlayer.seekTo(goTo)}
                        style={{
                          width: barWidth,
                          height: baseHeight + extraHeight,
                          marginRight: index === n - 1 ? 0 : gap,
                          borderRadius: scaleSize(2),
                          backgroundColor: isPlayed
                            ? '#40B0EB'
                            : loading
                            ? 'rgba(230,230,230,0.45)'
                            : '#E6E6E6',
                        }}
                      />
                    );
                  });
                })()}
              </View>

              <View style={tw`flex-row justify-between w-11/12 mt-3 mb-6`}>
                <Text style={tw`text-white text-xs`}>
                  {parseDuration(progress.position)}
                </Text>
                <Text style={tw`text-white text-xs`}>
                  {parseDuration(progress.duration)}
                </Text>
              </View>

              <View style={styles.playerControls}>
                <Pressable
                  onPress={toggleRepeat}
                  android_ripple={{color: 'transparent', borderless: false}}
                  style={({pressed}) => [
                    styles.sideControlButton,
                    repeatMode && styles.sideControlActive,
                    pressed && styles.controlPressed,
                  ]}>
                  <Ionicons
                    name="repeat"
                    size={28}
                    color={repeatMode ? '#22C7FF' : '#FFFFFF'}
                  />
                </Pressable>

                <Pressable
                  onPress={handleSkipToPrevious}
                  android_ripple={{color: 'transparent', borderless: false}}
                  style={({pressed}) => [
                    styles.sideControlButton,
                    pressed && styles.controlPressed,
                  ]}>
                  <Ionicons name="play-skip-back" size={28} color="#FFFFFF" />
                </Pressable>

                <Pressable
                  onPress={
                    playbackState.state === State.Playing
                      ? handlePause
                      : handlePlay
                  }
                  style={({pressed}) => [
                    styles.mainControlButton,
                    pressed && styles.mainControlPressed,
                  ]}>
                  <View style={styles.mainControlRingOne}>
                    <View style={styles.mainControlRingTwo}>
                      <View style={styles.mainControlInner}>
                        <Ionicons
                          name={
                            playbackState.state === State.Playing
                              ? 'pause'
                              : 'play'
                          }
                          size={36}
                          color="#FFFFFF"
                          style={
                            playbackState.state === State.Playing
                              ? undefined
                              : styles.playIconFix
                          }
                        />
                      </View>
                    </View>
                  </View>
                </Pressable>

                <Pressable
                  onPress={handleSkipToNext}
                  android_ripple={{color: 'transparent', borderless: false}}
                  style={({pressed}) => [
                    styles.sideControlButton,
                    pressed && styles.controlPressed,
                  ]}>
                  <Ionicons
                    name="play-skip-forward"
                    size={28}
                    color="#FFFFFF"
                  />
                </Pressable>

                <Pressable
                  onPress={toggleShuffle}
                  android_ripple={{color: 'transparent', borderless: false}}
                  style={({pressed}) => [
                    styles.sideControlButton,
                    shuffleMode && styles.sideControlActive,
                    pressed && styles.controlPressed,
                  ]}>
                  <Ionicons
                    name="shuffle"
                    size={28}
                    color={shuffleMode ? '#22C7FF' : '#FFFFFF'}
                  />
                </Pressable>
              </View>
            </ScrollView>
          </Wrapper>
        </>
      ) : (
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={tw`text-white text-base`}>Loading...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  coverWrapper: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: scaleSize(24),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: scaleSize(24),
    alignSelf: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },

  playerControls: {
    width: '91.666667%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    alignSelf: 'center',
  },

  sideControlButton: {
    width: scaleSize(58),
    height: scaleSize(58),
    borderRadius: scaleSize(22),
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(255,255,255,0.10)',

    borderWidth: scaleSize(1.5),
    borderColor: 'rgba(210,240,255,0.42)',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: scaleSize(8),
    },
    shadowOpacity: 0.22,
    shadowRadius: scaleSize(12),
  },

  sideControlActive: {
    backgroundColor: 'rgba(34,199,255,0.16)',
    borderColor: '#22C7FF',
  },

  mainControlButton: {
    width: scaleSize(72),
    height: scaleSize(72),
    borderRadius: scaleSize(36),
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'transparent',

    shadowColor: '#18BFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.72,
    shadowRadius: scaleSize(16),
  },

  mainControlRingOne: {
    width: scaleSize(72),
    height: scaleSize(72),
    borderRadius: scaleSize(36),
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(30,190,255,0.10)',

    borderWidth: scaleSize(3),
    borderColor: '#21C6FF',
  },

  mainControlRingTwo: {
    width: scaleSize(62),
    height: scaleSize(62),
    borderRadius: scaleSize(31),
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(255,255,255,0.05)',

    borderWidth: scaleSize(2),
    borderColor: 'rgba(95,215,255,0.72)',
  },

  mainControlInner: {
    width: scaleSize(50),
    height: scaleSize(50),
    borderRadius: scaleSize(25),
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(20,35,50,0.32)',

    borderWidth: scaleSize(1),
    borderColor: 'rgba(255,255,255,0.16)',
  },

  playIconFix: {
    marginLeft: scaleSize(3),
  },

  controlPressed: {
    transform: [{scale: 0.94}],
    opacity: 0.9,
  },

  mainControlPressed: {
    transform: [{scale: 0.93}],
    opacity: 0.92,
  },
});

export default SongScreen;
