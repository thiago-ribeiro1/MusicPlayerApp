import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, Pressable, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import TrackPlayer, { useActiveTrack, usePlaybackState, State, useProgress, RepeatMode } from 'react-native-track-player';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import type { SongType } from '../types';
import Wrapper from '../components/Wrapper';
import { useNavigation } from '@react-navigation/native';
import { useSongs } from '../hooks/useSongs';
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

  function shuffleArray<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  const toggleShuffle = useCallback(async () => {
    const newShuffle = !shuffleMode;

    const currentUrl = (activeTrack || localTrack)?.url;
    const currentSong = songs.find(song => song.url === currentUrl);
    const newList = newShuffle ? shuffleArray(songs) : songs;
    const newIndex = newList.findIndex(song => song.url === currentUrl);

    if (!currentSong || newIndex === -1) return;

    setLocalTrack(currentSong);

    const wasPlaying = playbackState.state === State.Playing;

    // await TrackPlayer.reset();
    await TrackPlayer.add(newList);
    await TrackPlayer.skip(newIndex);

    if (wasPlaying) {
      await TrackPlayer.play();
    }

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

  const handleWaveformPress = async (index: number) => {
    const position = (index / 50) * (progress.duration || 1);
    await TrackPlayer.seekTo(position);
  };

  const fakeData = Array.from({ length: 50 }, () => Math.random() * 40 + 20);
  
  // LIMPAR localTrack após activeTrack assumir
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
          {/* Fundo com a capa em blur */}
          <Image
            source={track.cover ? { uri: track.cover } : require('../assets/song-cover.png')}
            style={tw`absolute w-full h-full`}
            blurRadius={40}
            resizeMode="cover"
          />
  
          {/* Overlay escuro sobre o blur para melhor contraste */}
          <View style={tw`absolute w-full h-full bg-black/30`} />
  
          {/* Conteúdo principal com Wrapper transparente */}
          <Wrapper backgroundColor="transparent">
            <StatusBar backgroundColor="#000" barStyle="light-content" translucent />
  
            {/* Botão Voltar */}
            <TouchableOpacity style={tw`absolute top-12 left-5 z-10`} onPress={() => navigation.goBack()}>
              <ArrowLeftIcon size={28} color="white" />
            </TouchableOpacity>
  
            <View style={tw`flex-1 items-center justify-start mt-28`}>
              {/* Capa sem blur */}
              <Image
                source={track.cover ? { uri: track.cover } : require('../assets/song-cover.png')}
                style={tw`w-65 h-65 rounded-2xl mb-6 border border-white/10`}
                resizeMode="cover"
              />
  
              {/* Nome da música */}
              <Text style={FontsStyle.musicTitle}>{track.title}</Text>
  
              {/* Nome do artista */}
              <Text style={tw`text-gray-400 text-base mb-6 text-center`}>
                {track.artist !== '<unknown>' ? track.artist : 'Unknown Artist'}
              </Text>
  
              {/* Soundwave */}
              <View style={tw`flex-row items-end h-16 w-11/12 justify-center`}>
                {fakeData.map((value, index) => {
                  const isPlayed = index < ((progress.position || 0) / (progress.duration || 1)) * 50;
                  return (
                    <Pressable
                      key={index}
                      onPress={() => handleWaveformPress(index)}
                      style={{
                        width: 5,
                        height: value,
                        marginHorizontal: 1,
                        borderRadius: 2,
                        backgroundColor: isPlayed ? '#40B0EB' : '#ccc',
                      }}
                    />
                  );
                })}
              </View>
  
              {/* Tempo atual e duração */}
              <View style={tw`flex-row justify-between w-10/12 mt-3 mb-6`}>
                <Text style={tw`text-white text-xs`}>{parseDuration(progress.position)}</Text>
                <Text style={tw`text-white text-xs`}>{parseDuration(progress.duration)}</Text>
              </View>
  
              {/* Controles */}
              <View style={tw`flex-row items-center justify-around w-11/12`}>
                <Pressable onPress={toggleShuffle}>
                  <Ionicons name="shuffle" size={28} color={shuffleMode ? '#1684D9' : 'white'} />
                </Pressable>
  
                <Pressable onPress={handleSkipToPrevious}>
                  <Ionicons name="play-skip-back" size={28} color="white" />
                </Pressable>
  
                <Pressable onPress={playbackState.state === State.Playing ? handlePause : handlePlay}>
                  <View style={tw`w-16 h-16 rounded-full bg-blue-500 items-center justify-center`}>
                    {playbackState.state === State.Playing ? (
                      <Ionicons name="pause" size={36} color="white" />
                    ) : (
                      <Ionicons name="play" size={36} color="white" />
                    )}
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
};

export default SongScreen;