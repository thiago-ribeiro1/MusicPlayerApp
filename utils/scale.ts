import {Dimensions, PixelRatio, useWindowDimensions} from 'react-native';

// Base usada no design (ex: Galaxy S20/S24)
const BASE_WIDTH = 360;
const BASE_HEIGHT = 800;

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export function scaleSize(size: number) {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
}

export function scaleFont(size: number) {
  return size * PixelRatio.getFontScale();
}

// Novas funções responsivas (reagem a rotação/densidade em tempo real)
export function useResponsiveScale() {
  const {width, height} = useWindowDimensions();
  const fontScale = PixelRatio.getFontScale();

  const scaleSizeDyn = (size: number) => (width / BASE_WIDTH) * size;
  const verticalScale = (size: number) => (height / BASE_HEIGHT) * size;
  const moderateScale = (size: number, factor = 0.5) =>
    size + (scaleSizeDyn(size) - size) * factor;

  const scaleFontDyn = (size: number) => size * fontScale;

  const toDP = (px: number) => px / PixelRatio.get();
  const toPX = (dp: number) => dp * PixelRatio.get();

  return {
    width,
    height,
    isLandscape: width > height,
    scaleSize: scaleSizeDyn,
    verticalScale,
    moderateScale,
    scaleFont: scaleFontDyn,
    toDP,
    toPX,
  };
}
