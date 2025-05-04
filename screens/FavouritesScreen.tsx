import {View, Text, Pressable, ScrollView} from 'react-native';
import React from 'react';
import tw from 'twrnc';
import {FlashList} from '@shopify/flash-list';

import Wrapper from '../components/Wrapper';
import Header from '../components/Header';
import SongCard from '../components/SongCard';
import Player from '../components/Player';
import {useSongs} from '../hooks/useSongs';
import {useFavourties} from '../hooks/useFavourites';

const FavouritesScreen = () => {
  const {songs} = useSongs();
  const {favourites} = useFavourties();
  return (
    <Wrapper backgroundColor="#080809">
      <ScrollView>
        <Header title="Favorites" />

        <View style={tw`px-5 mt-8 min-h-40`}>
          {favourites.length === 0 && (
            <Text style={tw`text-white-500 text-center text-base font-medium`}>
              Nothing here
            </Text>
          )}
          <FlashList
            data={favourites}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({item}) => {
              return (
                <SongCard
                  song={item}
                  index={songs.findIndex(song => song.url === item.url)}
                />
              );
            }}
            estimatedItemSize={100}
          />
        </View>
      </ScrollView>

      <Player />
    </Wrapper>
  );
};

export default FavouritesScreen;
