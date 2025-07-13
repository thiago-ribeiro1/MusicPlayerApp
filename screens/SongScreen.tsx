import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Dimensions,
  StatusBar,
  StyleSheet,
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

const {width} = Dimensions.get('window');

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

  const {waveform} = useWaveform(track?.url);

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

  const handleSeekTo = useCallback(async (value: number) => {
    await TrackPlayer.seekTo(value);
  }, []);

  const handleWaveformPress = async (index: number) => {
    const position = (index / waveform.length) * (progress.duration || 1);
    await TrackPlayer.seekTo(position);
  };

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
              backgroundColor="#000"
              barStyle="light-content"
              translucent
            />
            <View style={{position: 'absolute', top: 48, left: 20, zIndex: 10}}>
              <GoBackButton />
            </View>

            <View style={tw`flex-1 items-center justify-start mt-28`}>
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

              <Text style={FontsStyle.musicTitle}>{track.title}</Text>
              <Text style={tw`text-gray-400 text-base mb-6 text-center`}>
                {track.artist !== '<unknown>' ? track.artist : 'Unknown Artist'}
              </Text>

              <View style={tw`flex-row items-end h-16 w-11/12 justify-center`}>
                {waveform.map((value, index) => {
                  const isPlayed =
                    index <
                    ((progress.position || 0) / (progress.duration || 1)) *
                      waveform.length;
                  return (
                    <Pressable
                      key={index}
                      onPress={() => handleWaveformPress(index)}
                      style={{
                        width: 5,
                        height: 20 + value * 40,
                        marginHorizontal: 1,
                        borderRadius: 2,
                        backgroundColor: isPlayed ? '#40B0EB' : '#ccc',
                      }}
                    />
                  );
                })}
              </View>

              <View style={tw`flex-row justify-between w-11/12 mt-3 mb-6`}>
                <Text style={tw`text-white text-xs`}>
                  {parseDuration(progress.position)}
                </Text>
                <Text style={tw`text-white text-xs`}>
                  {parseDuration(progress.duration)}
                </Text>
              </View>

              <View style={tw`flex-row items-center justify-around w-11/12`}>
                <Pressable onPress={toggleShuffle}>
                  <Ionicons
                    name="shuffle"
                    size={28}
                    color={shuffleMode ? '#1684D9' : 'white'}
                  />
                </Pressable>
                <Pressable onPress={handleSkipToPrevious}>
                  <Ionicons name="play-skip-back" size={28} color="white" />
                </Pressable>
                <Pressable
                  onPress={
                    playbackState.state === State.Playing
                      ? handlePause
                      : handlePlay
                  }>
                  <View
                    style={tw`w-16 h-16 rounded-full bg-blue-500 items-center justify-center`}>
                    <Ionicons
                      name={
                        playbackState.state === State.Playing ? 'pause' : 'play'
                      }
                      size={36}
                      color="white"
                    />
                  </View>
                </Pressable>
                <Pressable onPress={handleSkipToNext}>
                  <Ionicons name="play-skip-forward" size={28} color="white" />
                </Pressable>
                <Pressable onPress={toggleRepeat}>
                  <Ionicons
                    name="repeat"
                    size={28}
                    color={repeatMode ? '#1684D9' : 'white'}
                  />
                </Pressable>
              </View>
            </View>
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
    width: scaleSize(260),
    height: scaleSize(260),
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
});

export default SongScreen;
