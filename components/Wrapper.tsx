import {View, StatusBar, StyleProp, ViewStyle} from 'react-native';
import React from 'react';
import tw from 'twrnc';

const Wrapper = ({
  children,
  style,
  backgroundColor = '#100f14',
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
}) => {
  return (
    <>
      <View style={[tw`flex-1`, {backgroundColor}, style]}>{children}</View>
    </>
  );
};

export default Wrapper;
