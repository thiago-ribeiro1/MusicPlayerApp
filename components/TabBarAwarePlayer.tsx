import React, {useState} from 'react';
import {Animated} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import Player from './Player';
import {tabBarHidden} from '../hooks/useTabBarScroll';

const TabBarAwarePlayer = ({
  backgroundColor = '#080809',
}: {
  backgroundColor?: string;
}) => {
  const tabBarHeight = useBottomTabBarHeight();
  const [playerHeight, setPlayerHeight] = useState(0);

  return (
    <Animated.View
      pointerEvents="box-none"
      onLayout={e => setPlayerHeight(e.nativeEvent.layout.height)}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: tabBarHeight,
        // Fundo sólido: as margens do Player não mostram a lista rolando por trás
        backgroundColor,
        transform: [
          {
            // Some junto com a tab bar: desce a altura da barra + a própria altura
            translateY: tabBarHidden.interpolate({
              inputRange: [0, 1],
              outputRange: [0, tabBarHeight + playerHeight],
            }),
          },
        ],
      }}>
      <Player />
    </Animated.View>
  );
};

export default TabBarAwarePlayer;
