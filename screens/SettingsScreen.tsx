import {View, Text, Pressable} from 'react-native';
import React, {useCallback} from 'react';
import tw from 'twrnc';
import {SafeAreaView} from 'react-native-safe-area-context';
import Wrapper from '../components/Wrapper';
import Header from '../components/Header';
import {useFavourties} from '../hooks/useFavourites';
import {FontsStyle} from '../styles/FontsStyle';

const SettingsScreen = () => {
  const {setFavourites} = useFavourties();

  const removeAllFavourites = useCallback(async () => {
    await setFavourites([]);
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#080809'}} edges={['top']}>
      <Wrapper backgroundColor="#080809">
        <Header showBackButton />

        <Text style={FontsStyle.settingsTitle}>Settings</Text>

        <View style={tw`pt-7`}>
          <View style={tw`pb-4 flex-row justify-between items-center px-5`}>
            <Text style={FontsStyle.removeAllFavorites}>
              Remove all favorites
            </Text>
            <Pressable
              style={tw`bg-rose-600 px-4 py-2 rounded-lg`}
              onPress={removeAllFavourites}>
              <Text style={tw`text-white`}>Remove</Text>
            </Pressable>
          </View>
        </View>

        <View style={tw`px-5 pt-4`}>
          <Text style={tw`text-white text-lg font-medium`}>Music Player</Text>
          <Text style={tw`text-white text-xs`}>Version 1.2.0</Text>
        </View>
      </Wrapper>
    </SafeAreaView>
  );
};

export default SettingsScreen;
