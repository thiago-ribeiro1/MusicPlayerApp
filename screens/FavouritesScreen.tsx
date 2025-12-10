import {StatusBar, View, Text, ScrollView} from 'react-native';
import React from 'react';
import tw from 'twrnc';
import {FlashList} from '@shopify/flash-list';
import Header from '../components/Header';
import SongCard from '../components/SongCard';
import Player from '../components/Player';
import {useSongs} from '../hooks/useSongs';
import {useFavourties} from '../hooks/useFavourites';
import {getOrderedSongsByAlbum} from '../components/orderByAlbum';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const FavouritesScreen = () => {
  const {songs} = useSongs();
  const {favourites} = useFavourties();

  const orderedFavourites = getOrderedSongsByAlbum(favourites);
  const orderedSongs = getOrderedSongsByAlbum(songs);

  const favGroupKey = React.useMemo(
    () => `favorites::${orderedFavourites.map(s => s.url ?? s.id).join('|')}`,
    [orderedFavourites],
  );

  const insets = useSafeAreaInsets();

  return (
    <>
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
