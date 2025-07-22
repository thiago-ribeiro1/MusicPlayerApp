import {Text, View, useWindowDimensions} from 'react-native';
import MarqueeView from 'react-native-marquee-view';

import {TextStyle} from 'react-native';

type AutoMarqueeTitleProps = {
  title: string;
  textStyle: TextStyle | TextStyle[];
};

export const AutoMarqueeTitle = ({title, textStyle}: AutoMarqueeTitleProps) => {
  const {width} = useWindowDimensions();
  const containerWidth = width * 0.85;
  const avgCharWidth = 9;
  const charLimit = Math.floor(containerWidth / avgCharWidth);
  const showMarquee = title.length > charLimit;

  return (
    <View style={{width: containerWidth, alignItems: 'center'}}>
      {showMarquee ? (
        <MarqueeView style={{width: '85%'}} speed={0.1}>
          <Text style={textStyle} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
        </MarqueeView>
      ) : (
        <Text style={textStyle} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      )}
    </View>
  );
};
