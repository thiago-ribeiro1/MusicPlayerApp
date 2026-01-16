import {View, Text, TextInput} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import tw from 'twrnc';
import {FlashList} from '@shopify/flash-list';
import Wrapper from '../components/Wrapper';
import {useSongs} from '../hooks/useSongs';
import SongCard from '../components/SongCard';
import {FontsStyle} from '../styles/FontsStyle';
import styles from '../styles/SongsScreenStyle';
import GoBackButton from '../components/GoBackButton';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  State,
  useActiveTrack,
  usePlaybackState,
} from 'react-native-track-player';
import {useFavourties} from '../hooks/useFavourites';
import type {SongType} from '../types';

const SearchScreen = () => {
  const {songs} = useSongs();

  const [filteredSongs, setFilteredSongs] = useState(songs);
  const [searchTerm, setSearchTerm] = useState('');

  const {favourites, setFavourites} = useFavourties();
  const favouritesRef = useRef<SongType[]>(favourites);
  useEffect(() => {
    favouritesRef.current = favourites;
  }, [favourites]);

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

  const filterSongs = useCallback(() => {
    if (searchTerm === '') {
      if (filteredSongs === songs) {
        return;
      } else {
        setFilteredSongs(songs);
      }
    } else {
      const queriedSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      setFilteredSongs(queriedSongs);
    }
  }, [searchTerm, songs, filteredSongs]);

  useEffect(() => {
    filterSongs();
  }, [searchTerm, songs]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#080809'}} edges={['top']}>
      <Wrapper backgroundColor="#080809">
        <View style={tw`flex-row px-5 gap-x-3 items-center pt-2`}>
          <GoBackButton />
        </View>

        <View style={tw`px-5 mt-8`}>
          <TextInput
            style={styles.searchInput}
            placeholder="search"
            placeholderTextColor="#A1A1AA"
            autoFocus
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <View style={tw`px-5 mt-8 gap-y-6 h-full`}>
          <Text style={FontsStyle.matchingSongs}>Matching songs</Text>

          {filteredSongs.length === 0 && (
            <Text style={tw`text-white-500 text-center text-base font-medium`}>
              Nothing here
            </Text>
          )}

          <FlashList
            data={filteredSongs}
            keyExtractor={item => String(item.url ?? item.id)}
            extraData={{favourites, activeUrl, isPlaying}} // resolve bug de pressable não atualizar
            renderItem={({item, index}) => {
              return (
                <SongCard
                  song={item}
                  index={songs.findIndex(song => song.url === item.url)}
                  allSongs={songs}
                  activeUrl={activeUrl}
                  isPlaying={isPlaying}
                  isFavourite={favSet.has(item.url)}
                  onToggleFavourite={onToggleFavourite}
                />
              );
            }}
            estimatedItemSize={100}
          />
        </View>
      </Wrapper>
    </SafeAreaView>
  );
};

export default SearchScreen;
