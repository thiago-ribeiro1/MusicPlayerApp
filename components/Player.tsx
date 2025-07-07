import {View, Text, Image, Pressable} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import tw from 'twrnc';
import TrackPlayer, {
  State,
  useActiveTrack,
  usePlaybackState,
} from 'react-native-track-player';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import MarqueeView from 'react-native-marquee-view';
import type {SongType} from '../types';
import {useSongs} from '../hooks/useSongs';
import {FontsStyle} from '../styles/FontsStyle';

const Player = () => {
  const activeTrack = useActiveTrack() as SongType | null;
  const playbackState = usePlaybackState();
  const navigation = useNavigation();
  const {songs} = useSongs();

  const currentSong = songs.find(
    s => s.url === activeTrack?.url || s.url === activeTrack?.id,
  );

  const [wasClicked, setWasClicked] = useState(false);

  useEffect(() => {
    if (wasClicked) {
      const timeout = setTimeout(() => {
        setWasClicked(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [wasClicked]);

  const handlePlay = useCallback(async () => {
    setWasClicked(true);
    await TrackPlayer.play();
  }, []);

  const handlePause = useCallback(async () => {
    setWasClicked(true);
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

  if (!activeTrack?.title) return null;

  const isPlaying = playbackState.state === State.Playing;
  const showPauseIcon = isPlaying || wasClicked;

  return (
    <Pressable
      style={tw`bg-gray-800 p-2 mx-2 mb-2 rounded-2xl flex-row items-center justify-between`}
      onPress={() => {
        //@ts-ignore
        navigation.navigate('Song');
      }}>
      <View style={tw`flex-row items-center gap-x-3`}>
        <Image
          source={
            currentSong?.cover
              ? {uri: currentSong.cover}
              : require('../assets/song-cover.png')
          }
          style={tw`w-12 h-12 rounded-xl`}
        />

        <View style={tw`gap-y-1`}>
          <MarqueeView style={tw`w-40`}>
            <Text style={FontsStyle.songTitlePlayer}>{activeTrack.title}</Text>
          </MarqueeView>
          <Text style={tw`text-gray-400 text-xs max-w-48`}>
            {activeTrack.artist !== '<unknown>'
              ? activeTrack.artist
              : 'Unknown'}
          </Text>
        </View>
      </View>

      <View style={tw`flex-row gap-x-3 items-center`}>
        <Pressable onPress={handleSkipToPrevious}>
          <Ionicons name="play-skip-back" size={22} color="white" />
        </Pressable>
        {showPauseIcon ? (
          <Pressable onPress={handlePause}>
            <Ionicons name="pause" size={22} color="white" />
          </Pressable>
        ) : (
          <Pressable onPress={handlePlay}>
            <Ionicons name="play" size={22} color="white" />
          </Pressable>
        )}
        <Pressable onPress={handleSkipToNext}>
          <Ionicons name="play-skip-forward" size={22} color="white" />
        </Pressable>
      </View>
    </Pressable>
  );
};

export default Player;
