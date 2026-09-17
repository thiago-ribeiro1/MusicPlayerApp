import {useCallback, useRef} from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

// 0 = tab bar visível, 1 = escondida (compartilhado entre tab bar e Player)
export const tabBarHidden = new Animated.Value(0);
let isHidden = false;

export const setTabBarHidden = (next: boolean) => {
  if (isHidden === next) return;
  isHidden = next;
  Animated.timing(tabBarHidden, {
    toValue: next ? 1 : 0,
    duration: 220,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
};

// Distância acumulada na mesma direção antes de trocar o estado (anti-flicker)
const THRESHOLD = 24;

export const useTabBarScroll = () => {
  const lastY = useRef(0);
  const accumulated = useRef(0);
  const layoutHeight = useRef(0);

  // Sempre mostra ao focar a tela (troca de tab / voltar de Song, Search etc.)
  useFocusEffect(
    useCallback(() => {
      accumulated.current = 0;
      setTabBarHidden(false);
    }, []),
  );

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = e.nativeEvent;
    const maxY = contentSize.height - layoutMeasurement.height;
    const y = Math.min(Math.max(contentOffset.y, 0), Math.max(maxY, 0));

    // Conteúdo não rola ou voltou ao topo: barra visível
    if (maxY <= 0 || y <= 0) {
      lastY.current = y;
      accumulated.current = 0;
      setTabBarHidden(false);
      return;
    }

    const dy = y - lastY.current;
    lastY.current = y;
    if (dy === 0) return;

    // Mudou de direção: zera o acumulado
    if (
      (dy > 0 && accumulated.current < 0) ||
      (dy < 0 && accumulated.current > 0)
    ) {
      accumulated.current = 0;
    }
    accumulated.current += dy;

    if (accumulated.current > THRESHOLD) {
      accumulated.current = 0;
      setTabBarHidden(true);
    } else if (accumulated.current < -THRESHOLD) {
      accumulated.current = 0;
      setTabBarHidden(false);
    }
  }, []);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    layoutHeight.current = e.nativeEvent.layout.height;
  }, []);

  // Se o conteúdo encolher (ex.: troca SONGS → ALBUMS) e não rolar mais, mostra a barra
  const onContentSizeChange = useCallback((_w: number, h: number) => {
    if (h <= layoutHeight.current) setTabBarHidden(false);
  }, []);

  return {onScroll, onLayout, onContentSizeChange, scrollEventThrottle: 16};
};
