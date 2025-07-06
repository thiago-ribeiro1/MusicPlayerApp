import React from 'react';
import {View, Text, FlatList, StatusBar, TouchableOpacity} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {SongType} from '../types';
import SongCard from '../components/SongCard';
import {FontsStyle} from '../styles/FontsStyle';
import GoBackButton from '../components/GoBackButton';

type GroupSongsRouteParams = {
  title: string;
  songs: SongType[];
};

export default function GroupSongsScreen() {
  const route =
    useRoute<RouteProp<{params: GroupSongsRouteParams}, 'params'>>();
  const {title, songs} = route.params;

  const navigation = useNavigation();

  return (
    <View style={{flex: 1, backgroundColor: '#080809', padding: 16}}>
      <StatusBar backgroundColor="#080809" barStyle="light-content" />

      {/* Go Back */}
      <View
        style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{marginRight: 10}}>
          <GoBackButton />
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      <View style={{marginTop: 12, flex: 1}}>
        <Text style={FontsStyle.titleGroup}>{title}</Text>
        <FlatList
          data={songs}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({item, index}) => <SongCard song={item} index={index} />}
        />
      </View>
    </View>
  );
}
