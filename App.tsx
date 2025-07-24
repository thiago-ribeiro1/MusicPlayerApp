import {
  Text,
  PermissionsAndroid,
  Pressable,
  Alert,
  BackHandler,
  Linking,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import tw from 'twrnc';
import StackNavigator from './navigators/StackNavigator';
import Wrapper from './components/Wrapper';
import {setupPlayerIfNeeded} from './services/trackPlayerSetup';
import {setupTrackPlayerService} from './services/track-player.service';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

const App = () => {
  const [appReady, setAppReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const getPermission = useCallback(async () => {
    const permissionStatus = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
    );

    if (permissionStatus) {
      setPermissionDenied(false);
      initializeApp();
    } else {
      const request = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
      );

      if (request === PermissionsAndroid.RESULTS.GRANTED) {
        setPermissionDenied(false);
        initializeApp();
      } else {
        Alert.alert(
          'Permission required',
          'This app needs access to your audio files to work properly',
          [
            {
              text: 'Cancel',
              onPress: BackHandler.exitApp,
            },
            {
              text: 'Open Settings',
              onPress: Linking.openSettings,
            },
          ],
        );
      }
    }
  }, []);

  const initializeApp = useCallback(async () => {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
    );

    if (!hasPermission) {
      setPermissionDenied(true);
      return;
    }

    try {
      await setupPlayerIfNeeded();
      await setupTrackPlayerService();
    } catch (e) {
      console.warn('Erro ao iniciar app:', e);
    }

    setTimeout(() => {
      setAppReady(true);
    }, 4000);
  }, []);

  useEffect(() => {
    initializeApp();
  }, []);

  if (permissionDenied) {
    return (
      <Wrapper
        backgroundColor="#080809"
        style={tw`items-center justify-center gap-y-6`}>
        <Text style={tw`text-white-600 text-base font-medium`}>
          This app needs media permission to work
        </Text>

        <Pressable
          onPress={getPermission}
          style={tw`bg-blue-600 p-4 rounded-xl`}>
          <Text style={tw`text-white text-base font-medium`}>
            Give Permission
          </Text>
        </Pressable>
      </Wrapper>
    );
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <NavigationContainer>
        <StackNavigator appReady={appReady} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
