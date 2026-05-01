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
  const {loadMoreSongs} = useSongs();
  const {width, height} = useResponsiveScale();
  const {getFavourites} = useFavourties();

  const [initDone, setInitDone] = useState(false);
  const navigatedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await loadMoreSongs();
        if (cancelled) return;
        if (res.length > 0) {
          getFavourites();
          await TrackPlayer.reset();
          if (cancelled) return;
          await TrackPlayer.add(
            res.map(song => ({
              id: song.id,
              url: song.url,
              title: song.title,
              artist: song.artist,
              artwork: song.cover || require('../assets/song-cover.png'),
              duration: song.duration,
              album: song.album,
              folder: song.folder,
              trackNumber: song.trackNumber,
              lastModified: song.lastModified,
              fileSize: song.fileSize,
              cover: song.cover,
            })),
          );
        }
      } catch {
        // erro não deve travar a splash
      } finally {
        if (!cancelled) {
          setInitDone(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getFavourites, loadMoreSongs]);

  useEffect(() => {
    if (initDone && !navigatedRef.current) {
      navigatedRef.current = true;
      // @ts-ignore
      navigation.replace('Tabs');
    }
  }, [initDone, navigation]);

  return (
    <View style={[styles.container, {width, height}]}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <Video
        source={SPLASH_VIDEO}
        style={{width, height}}
        resizeMode="cover"
        repeat
        muted
        controls={false}
        paused={false}
        playWhenInactive={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080809',
    overflow: 'hidden',
  },
});
