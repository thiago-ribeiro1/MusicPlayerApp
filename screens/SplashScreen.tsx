import { ImageBackground, View, Image, ActivityIndicator, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { useSongs } from '../hooks/useSongs';
import { useFavourties } from '../hooks/useFavourites';
import TrackPlayer, { RepeatMode } from 'react-native-track-player';
import styles from '../styles/SplashScreenStyle';

export default function SplashScreen() {
  const navigation = useNavigation();
  const { loadMoreSongs } = useSongs();
  const { getFavourites } = useFavourties();
  const { songs } = useSongs();

  useEffect(() => {
    const init = async () => {
      const res = await loadMoreSongs(); 
      if (res.length > 0) {
        getFavourites();
        await TrackPlayer.reset();
        await TrackPlayer.add(res.map(song => ({
          id: song.id,
          url: song.url,
          title: song.title,
          artist: song.artist,
          artwork: song.cover || require('../assets/song-cover.png'),
          duration: song.duration,
        })));
        // @ts-ignore
        navigation.replace('Tabs');
      }
    };
    init();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#080809" barStyle="light-content" />

      {/* Background */}
      <ImageBackground
        source={require('../assets/bg-1.png')}
        style={styles.background}
      >
        
        {/* Gradiente preto no topo */}
        <View style={styles.gradientTop} />

        {/* Imagens principais */}
        <Image
          source={require('../assets/Girl_Fade.png')}
          style={styles.girl}
          resizeMode="contain"
        />
        <Image
          source={require('../assets/MusicPlayer.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Loading no rodapé */}
        <View style={styles.bottomContent}>
          <ActivityIndicator size={45} color="#40B0EB" />
        </View>
      </ImageBackground>
    </View>
  );
}
