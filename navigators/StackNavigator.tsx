import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import TabNavigator from './TabNavigator';
import SongScreen from '../screens/SongScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SearchScreen from '../screens/SearchScreen';
import GroupSongsScreen from '../screens/GroupSongsScreen';

type StackNavigatorProps = {
  appReady: boolean;
};

const Stack = createNativeStackNavigator();

const StackNavigator = ({appReady}: StackNavigatorProps) => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!appReady ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="Song" component={SongScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="GroupSongsScreen" component={GroupSongsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;
