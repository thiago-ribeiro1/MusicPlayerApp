import {View, Text, Image, Pressable} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import tw from 'twrnc';
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
import {FontsStyle} from '../styles/FontsStyle';

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
      setTimeout(() => setIsManuallyPlaying(false), 300); // sincroniza e limpa
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
    return `${Math.floor(seconds / 60)}:${
      Math.ceil(seconds % 60).toString().length === 1
        ? '0' + Math.ceil(seconds % 60).toString()
        : Math.ceil(seconds % 60)
    }`;
  }, []);

  const handlePlay = useCallback(async () => {
    setIsManuallyPlaying(true);

    try {
      const index = allSongs.findIndex(s => s.url === song.url);
      if (index === -1) {
        console.warn('Música não encontrada na lista atual');
        return;
      }

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
    <View style={tw`flex-row items-center justify-between px-2 mb-4`}>
      <View style={tw`flex-row items-center gap-x-5`}>
        <Image
          source={
            song.cover ? {uri: song.cover} : require('../assets/song-cover.png')
          }
          style={tw`w-16 h-16 rounded-xl`}
        />
        <View style={tw`gap-y-1`}>
          <MarqueeView style={tw`w-40`}>
            <Text style={FontsStyle.songTitle}>{song.title}</Text>
          </MarqueeView>
          <View style={tw`flex-col max-w-40`}>
            <Text style={tw`text-gray-300 text-xs`} numberOfLines={2}>
              {song.artist !== '<unknown>' ? song.artist : 'Unknown'} /{' '}
              {parseDuration(song.duration)}
            </Text>
          </View>
        </View>
      </View>

      <View style={tw`flex-row gap-x-4 items-center`}>
        {favourites.some(f => f.url === song.url) ? (
          <Pressable onPress={removeFromFavourites}>
            <FilledHeartIcon color="white" size={22} fill="#40B0EB" />
          </Pressable>
        ) : (
          <Pressable onPress={addToFavourites}>
            <EmptyHeartIcon color="white" size={22} />
          </Pressable>
        )}
        <Pressable
          style={[tw`rounded-full p-2`, {backgroundColor: '#1684D9'}]}
          onPress={showPauseIcon ? handlePause : handlePlay}>
          {showPauseIcon ? (
            <PauseIcon color="white" size={24} />
          ) : (
            <PlayIcon color="white" size={24} />
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default SongCard;
