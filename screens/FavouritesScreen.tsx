import {StatusBar, View, Text, ScrollView} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {
  State,
  useActiveTrack,
  usePlaybackState,
} from 'react-native-track-player';
import {useFavourties} from '../hooks/useFavourites';
import type {SongType} from '../types';
import tw from 'twrnc';
import {FlashList} from '@shopify/flash-list';
import Header from '../components/Header';
import SongCard from '../components/SongCard';
import Player from '../components/Player';
import {getOrderedSongsByAlbum} from '../components/orderByAlbum';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const FavouritesScreen = () => {
  const {favourites, setFavourites} = useFavourties();
  const favouritesRef = useRef<SongType[]>(favourites);
  useEffect(() => {
    favouritesRef.current = favourites;
  }, [favourites]);

  const orderedFavourites = getOrderedSongsByAlbum(favourites);

  const favGroupKey = React.useMemo(
    () => `favorites::${orderedFavourites.map(s => s.url ?? s.id).join('|')}`,
    [orderedFavourites],
  );

  const insets = useSafeAreaInsets();

  // 1x por tela (performance)
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const activeUrl = activeTrack?.url ?? null;
  const isPlaying = playbackState.state === State.Playing;

  // Set de favoritos (rápido e estável)
  const favSet = React.useMemo(
    () => new Set(favourites.map(f => f.url)),
    [favourites],
  );

  const onToggleFavourite = React.useCallback(
    async (song: SongType) => {
      if (!song.url) return;

      const current = favouritesRef.current;
      const exists = current.some(f => f.url === song.url);

      const next = exists
        ? current.filter(f => f.url !== song.url)
        : [...current, song];

      await setFavourites(next);
    },
    [setFavourites],
  );

  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + 5,
          backgroundColor: 'rgba(0,0,0,0.45)',
          zIndex: 5,
        }}
      />

      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <View style={{flex: 1, backgroundColor: '#080809'}}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top,
            paddingBottom: 80,
          }}>
          <Header title="Favorites" />

          <View style={tw`px-5 mt-8 min-h-40`}>
            {favourites.length === 0 && (
              <Text
                style={tw`text-white-500 text-center text-base font-medium`}>
                Nothing here
              </Text>
            )}

            <FlashList
              key={favGroupKey}
              data={orderedFavourites}
              keyExtractor={item => String(item.url ?? item.id)}
              renderItem={({item, index}) => (
                <SongCard
                  song={item}
                  index={index}
                  allSongs={orderedFavourites}
                  playContext={{
                    groupKey: favGroupKey,
                    list: orderedFavourites,
                  }}
                  activeUrl={activeUrl}
                  isPlaying={isPlaying}
                  isFavourite={favSet.has(item.url)}
                  onToggleFavourite={onToggleFavourite}
                />
              )}
              estimatedItemSize={100}
            />
          </View>
        </ScrollView>
        <Player />
      </View>
    </>
  );
};

export default FavouritesScreen;
