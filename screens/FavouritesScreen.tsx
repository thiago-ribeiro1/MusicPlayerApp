import {View, Text, ScrollView} from 'react-native';
import React from 'react';
import tw from 'twrnc';
import {FlashList} from '@shopify/flash-list';
import Wrapper from '../components/Wrapper';
import Header from '../components/Header';
import SongCard from '../components/SongCard';
import Player from '../components/Player';
import {useSongs} from '../hooks/useSongs';
import {useFavourties} from '../hooks/useFavourites';
import {getOrderedSongsByAlbum} from '../components/orderByAlbum';
import {SafeAreaView} from 'react-native-safe-area-context';

const FavouritesScreen = () => {
  const {songs} = useSongs();
  const {favourites} = useFavourties();

  const orderedFavourites = getOrderedSongsByAlbum(favourites);
  const orderedSongs = getOrderedSongsByAlbum(songs);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#080809'}} edges={['top']}>
      <Wrapper backgroundColor="#080809">
        <ScrollView>
          <Header title="Favorites" />

          <View style={tw`px-5 mt-8 min-h-40`}>
            {favourites.length === 0 && (
              <Text
                style={tw`text-white-500 text-center text-base font-medium`}>
                Nothing here
              </Text>
            )}
            <FlashList
              data={orderedFavourites}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({item}) => (
                <SongCard
                  song={item}
                  index={orderedSongs.findIndex(song => song.url === item.url)}
                  allSongs={orderedSongs}
                />
              )}
              estimatedItemSize={100}
            />
          </View>
        </ScrollView>
        <Player />
      </Wrapper>
    </SafeAreaView>
  );
};

export default FavouritesScreen;
