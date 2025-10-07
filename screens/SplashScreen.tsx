// SplashScreen.tsx
import React, {useEffect, useRef, useState} from 'react';
import {View, StatusBar, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Video from 'react-native-video';
import TrackPlayer from 'react-native-track-player';
import {useSongs} from '../hooks/useSongs';
import {useFavourties} from '../hooks/useFavourites';
import {useResponsiveScale} from '../utils/scale';

const SPLASH_VIDEO = require('../assets/MusicPlayer_Motion_FX.mp4');

export default function SplashScreen() {
  const navigation = useNavigation();
  const {width, height} = useResponsiveScale();
  const {loadMoreSongs} = useSongs();
  const {getFavourites} = useFavourties();

  const [initDone, setInitDone] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const navigatedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await loadMoreSongs();
        if (res.length > 0) {
          getFavourites();
          await TrackPlayer.reset();
          await TrackPlayer.add(
            res.map(song => ({
              id: song.id,
              url: song.url,
              title: song.title,
              artist: song.artist,
              artwork: song.cover || require('../assets/song-cover.png'),
              duration: song.duration,
            })),
          );
        }
      } catch {
        // erro não deve travar a splash
      } finally {
        setInitDone(true);
      }
    })();
  }, [getFavourites, loadMoreSongs]);

  useEffect(() => {
    if (initDone && videoReady && !navigatedRef.current) {
      navigatedRef.current = true;
      // @ts-ignore
      navigation.replace('Tabs');
    }
  }, [initDone, videoReady, navigation]);

  return (
    <View style={[styles.container, {width, height}]}>
      <StatusBar backgroundColor="#0F0817" barStyle="light-content" />
      <Video
        source={SPLASH_VIDEO}
        style={StyleSheet.absoluteFillObject} // ocupa toda a tela
        resizeMode="cover"
        repeat
        muted
        controls={false}
        paused={false}
        ignoreSilentSwitch="obey"
        playWhenInactive={false}
        onReadyForDisplay={() => setVideoReady(true)}
        onError={() => setVideoReady(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0817',
  },
});
