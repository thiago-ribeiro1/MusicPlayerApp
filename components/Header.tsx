import {View, Text, Pressable} from 'react-native';
import React, {useCallback} from 'react';
import tw from 'twrnc';
import {
  Cog8ToothIcon,
  ChevronLeftIcon,
  HeartIcon as FilledHeartIcon,
} from 'react-native-heroicons/solid';
import {HeartIcon as EmptyHeartIcon} from 'react-native-heroicons/outline';
import {useNavigation} from '@react-navigation/native';
import {useActiveTrack} from 'react-native-track-player';

import {useFavourties} from '../hooks/useFavourites';
import {SongType} from '../types';
import {FontsStyle} from '../styles/FontsStyle';

const Header = ({
  title,
  showBackButton = false,
  showFavouritesButton = false,
}: {
  title?: string;
  showBackButton?: boolean;
  showFavouritesButton?: boolean;
}) => {
  const {favourites, setFavourites} = useFavourties();
  const navigation = useNavigation();
  const activeTrack = useActiveTrack() as SongType;

  const addToFavourites = useCallback(async () => {
    if (!activeTrack) {
      return;
    }

    const newFavourites = [...favourites, {...activeTrack}];

    await setFavourites(newFavourites);
  }, [favourites, activeTrack]);

  const removeFromFavourites = useCallback(async () => {
    if (!activeTrack) {
      return;
    }

    const newFavourites = favourites.filter(
      favourite => favourite.url !== activeTrack.url,
    );

    await setFavourites(newFavourites);
  }, [activeTrack, favourites]);
  return (
    <View style={tw`flex-row px-5 justify-between items-center pt-2`}>
      {showBackButton ? (
        <Pressable onPress={navigation.goBack}>
          <ChevronLeftIcon color={'white'} size={24} />
        </Pressable>
      ) : (
        <Text style={FontsStyle.headerTitle}>{title}</Text>
      )}

      <View style={tw`flex-row gap-x-4 items-center`}>
        {showFavouritesButton && (
          <>
            {favourites
              .map(favourite => favourite.url)
              .includes(activeTrack?.url) ? (
              <Pressable onPress={removeFromFavourites}>
                <FilledHeartIcon color={'white'} size={24} fill={'red'} />
              </Pressable>
            ) : (
              <Pressable onPress={addToFavourites}>
                <EmptyHeartIcon color={'white'} size={24} />
              </Pressable>
            )}
          </>
        )}

        {!showBackButton && (
          <Pressable
            onPress={() => {
              // @ts-ignore
              navigation.navigate('Settings');
            }}>
            <Cog8ToothIcon color={'white'} size={24} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default Header;