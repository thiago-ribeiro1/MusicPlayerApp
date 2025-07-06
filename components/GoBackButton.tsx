import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

export default function GoBackButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{marginRight: 10}}>
      <Ionicons name="arrow-back" size={30} color="white" />
    </TouchableOpacity>
  );
}
