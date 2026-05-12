import React, {useEffect, useRef, memo} from 'react';
import {View, Animated, StyleSheet} from 'react-native';
import {scaleSize} from '../utils/scale';

const SKELETON_BASE = 'rgba(255,255,255,0.09)';
const SKELETON_SECONDARY = 'rgba(255,255,255,0.06)';

const COVER_SIZE = scaleSize(64);
const COVER_RADIUS = scaleSize(12);
const HEART_SIZE = scaleSize(22);
const PLAY_SIZE = scaleSize(40);

type SkeletonItemProps = {
  animOpacity: Animated.Value;
};

const SongCardSkeleton = memo(({animOpacity}: SkeletonItemProps) => (
  <Animated.View style={[styles.container, {opacity: animOpacity}]}>
    <View style={styles.leftSection}>
      <View style={styles.cover} />
      <View style={styles.textContainer}>
        <View style={styles.titleLine} />
        <View style={styles.subtitleLine} />
      </View>
    </View>
    <View style={styles.rightSection}>
      <View style={styles.heartPlaceholder} />
      <View style={styles.playPlaceholder} />
    </View>
  </Animated.View>
));

export const SongCardSkeletonList = memo(({count}: {count: number}) => {
  const animOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(animOpacity, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(animOpacity, {
          toValue: 0.55,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [animOpacity]);

  return (
    <View>
      {Array.from({length: count}, (_, i) => (
        <SongCardSkeleton key={i} animOpacity={animOpacity} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scaleSize(16),
    paddingHorizontal: scaleSize(8),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(16),
  },
  cover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: COVER_RADIUS,
    backgroundColor: SKELETON_BASE,
  },
  textContainer: {
    flexDirection: 'column',
    gap: scaleSize(6),
  },
  titleLine: {
    width: scaleSize(120),
    height: scaleSize(13),
    borderRadius: 4,
    backgroundColor: SKELETON_BASE,
  },
  subtitleLine: {
    width: scaleSize(80),
    height: scaleSize(11),
    borderRadius: 4,
    backgroundColor: SKELETON_SECONDARY,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(12),
  },
  heartPlaceholder: {
    width: HEART_SIZE,
    height: HEART_SIZE,
    borderRadius: 999,
    backgroundColor: SKELETON_SECONDARY,
  },
  playPlaceholder: {
    width: PLAY_SIZE,
    height: PLAY_SIZE,
    borderRadius: 999,
    backgroundColor: SKELETON_BASE,
  },
});
