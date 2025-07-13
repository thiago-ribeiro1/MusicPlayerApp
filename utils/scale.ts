import {Dimensions, PixelRatio} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const BASE_WIDTH = 360; // base do design (ex: Galaxy S20/S24)

export function scaleSize(size: number) {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
}

export function scaleFont(size: number) {
  return size * PixelRatio.getFontScale();
}
