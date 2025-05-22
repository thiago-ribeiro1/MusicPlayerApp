import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Image, Pressable, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State, useProgress, RepeatMode } from 'react-native-track-player';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import type { SongType } from '../types';
import Wrapper from '../components/Wrapper';
import { useNavigation } from '@react-navigation/native';
import { useSongs } from '../hooks/useSongs';
import { useWaveform } from '../hooks/useWaveform';
import { FontsStyle } from '../styles/FontsStyle';

const { width } = Dimensions.get('window');

const SongScreen = () => {
  const { songs } = useSongs();
  const activeTrack = useActiveTrack() as SongType;
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const navigation = useNavigation();

  const [localTrack, setLocalTrack] = useState<SongType | null>(null);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false);

  const track = activeTrack || localTrack;

  const { waveform } = useWaveform(track?.url);

  const handlePlay = useCallback(async () => {
    await TrackPlayer.play();
  }, []);

  const handlePause = useCallback(async () => {
    await TrackPlayer.pause();
  }, []);

  const handleSkipToPrevious = useCallback(async () => {
    await TrackPlayer.skipToPrevious();
    await TrackPlayer.play();
  }, []);

  const handleSkipToNext = useCallback(async () => {
    await TrackPlayer.skipToNext();
    await TrackPlayer.play();
  }, []);

  const handleSeekTo = useCallback(async (value: number) => {
    await TrackPlayer.seekTo(value);
  }, []);

  const handleWaveformPress = async (index: number) => {
    const position = (index / waveform.length) * (progress.duration || 1);
    await TrackPlayer.seekTo(position);
  };

  const toggleShuffle = useCallback(async () => {
    const newShuffle = !shuffleMode;
    const currentUrl = (activeTrack || localTrack)?.url;
    const currentSong = songs.find(song => song.url === currentUrl);
    const newList = newShuffle ? [...songs].sort(() => Math.random() - 0.5) : songs;
    const newIndex = newList.findIndex(song => song.url === currentUrl);

    if (!currentSong || newIndex === -1) return;

    setLocalTrack(currentSong);

    const wasPlaying = playbackState.state === State.Playing;

    await TrackPlayer.add(newList);
    await TrackPlayer.skip(newIndex);
    if (wasPlaying) await TrackPlayer.play();

    setShuffleMode(newShuffle);
  }, [shuffleMode, songs, activeTrack, localTrack, playbackState]);

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
    <View style={[tw`flex-1 w-full h-full`, { backgroundColor: '#000' }]}>
  {track ? (
    <>
      {/* Capa em blur no fundo */}
      <Image
        source={track.cover ? { uri: track.cover } : require('../assets/song-cover.png')}
        style={tw`absolute w-full h-full`}
        blurRadius={40}
        resizeMode="cover"
      />
      {/* Overlay escura */}
      <View style={tw`absolute w-full h-full bg-black/30`} />
      <Wrapper backgroundColor="transparent">
        <StatusBar backgroundColor="#000" barStyle="light-content" translucent />

        {/* Botão de voltar */}
        <TouchableOpacity style={tw`absolute top-12 left-5 z-10`} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={28} color="white" />
        </TouchableOpacity>

        {/* Conteúdo centralizado */}
        <View style={tw`flex-1 items-center justify-center px-5`}>
          {/* Capa principal */}
          <Image
            source={track.cover ? { uri: track.cover } : require('../assets/song-cover.png')}
            style={tw`w-65 h-65 rounded-2xl mb-6 border border-white/10`}
            resizeMode="cover"
          />

          {/* Título da música */}
          <Text style={FontsStyle.musicTitle}>{track.title}</Text>

          {/* Nome do artista */}
          <Text style={tw`text-gray-400 text-base mb-3 text-center`}>
            {track.artist !== '<unknown>' ? track.artist : 'Unknown Artist'}
          </Text>

          {/* Soundwave */}
          <View style={tw`flex-row items-end h-24 w-11/12 justify-center`}>
            {(waveform?.length ? waveform : Array(100).fill(0)).map((value, index) => {
              const isPlayed =
                index <
                ((progress.position || 0) / (progress.duration || 1)) *
                  waveform.length;

              return (
                <Pressable
                  key={index}
                  onPress={() => handleWaveformPress(index)}
                  style={{
                    width: 4,
                    height: Math.max(1, value * 63),
                    marginHorizontal: 1.5,
                    borderRadius: 9999,
                    backgroundColor: isPlayed ? '#40B0EB' : '#ccc',
                  }}
                />
              );
            })}
          </View>

          {/* Tempo atual / duração */}
          <View style={tw`flex-row justify-between w-11/12 mt-3 mb-6`}>
            <Text style={tw`text-white text-xs`}>{parseDuration(progress.position)}</Text>
            <Text style={tw`text-white text-xs`}>{parseDuration(progress.duration)}</Text>
          </View>

          {/* Controles do player */}
          <View style={tw`flex-row items-center justify-around w-11/12`}>
            <Pressable onPress={toggleShuffle}>
              <Ionicons name="shuffle" size={28} color={shuffleMode ? '#1684D9' : 'white'} />
            </Pressable>
            <Pressable onPress={handleSkipToPrevious}>
              <Ionicons name="play-skip-back" size={28} color="white" />
            </Pressable>
            <Pressable onPress={playbackState.state === State.Playing ? handlePause : handlePlay}>
              <View style={tw`w-16 h-16 rounded-full bg-blue-500 items-center justify-center`}>
                <Ionicons name={playbackState.state === State.Playing ? 'pause' : 'play'} size={36} color="white" />
              </View>
            </Pressable>
            <Pressable onPress={handleSkipToNext}>
              <Ionicons name="play-skip-forward" size={28} color="white" />
            </Pressable>
            <Pressable onPress={toggleRepeat}>
              <Ionicons name="repeat" size={28} color={repeatMode ? '#1684D9' : 'white'} />
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
}

export default SongScreen;
