import { ImageBackground, View, Image, ActivityIndicator, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { useSongs } from '../hooks/useSongs';
import { useFavourties } from '../hooks/useFavourites';
import TrackPlayer, { RepeatMode } from 'react-native-track-player';
import styles from '../styles/SplashScreenStyle';

export default function SplashScreen() {
  const navigation = useNavigation();
  const { getSongs } = useSongs();
  const { getFavourites } = useFavourties();

  useEffect(() => {
    getSongs().then(res => {
      if (res) {
        getFavourites();
        TrackPlayer.add(res).then(() => {
          TrackPlayer.setRepeatMode(RepeatMode.Queue).then(() => {
            // @ts-ignore
            navigation.replace('Tabs');
          });
        });
      }
    });
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
