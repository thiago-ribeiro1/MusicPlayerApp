import React from 'react';
import {View, Text, FlatList, StatusBar} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {SongType} from '../types';
import SongCard from '../components/SongCard';
import {FontsStyle} from '../styles/FontsStyle';
import GoBackButton from '../components/GoBackButton';
import {SafeAreaView} from 'react-native-safe-area-context';

type GroupSongsRouteParams = {
  title: string;
  songs: SongType[];
};

export default function GroupSongsScreen() {
  const route =
    useRoute<RouteProp<{params: GroupSongsRouteParams}, 'params'>>();
  const {title, songs} = route.params;

  // ordenação memorizada (evita recalcular e estabiliza assinatura)
  const orderedSongs = React.useMemo(() => {
    const copy = [...songs];
    copy.sort((a, b) => {
      if (!a.trackNumber) return 1;
      if (!b.trackNumber) return -1;
      return a.trackNumber - b.trackNumber;
    });
    return copy;
  }, [songs]);

  // chave única do grupo atual (força remount da FlatList + evita reaproveitamento errado)
  const groupKey = React.useMemo(
    () => `${title}::${orderedSongs.map(s => s.url ?? s.id).join('|')}`,
    [title, orderedSongs],
  );

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: '#080809'}}
      edges={['top', 'bottom']}>
      <View style={{flex: 1, backgroundColor: '#080809', padding: 16}}>
        <StatusBar backgroundColor="#080809" barStyle="light-content" />

        {/* Go Back */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <GoBackButton />
        </View>

        {/* Conteúdo */}
        <View style={{marginTop: 12, flex: 1}}>
          <Text style={FontsStyle.titleGroup}>{title}</Text>
          <FlatList
            key={groupKey}
            data={orderedSongs}
            keyExtractor={item => String(item.url ?? item.id)}
            renderItem={({item, index}) => (
              <SongCard
                song={item}
                index={index}
                allSongs={orderedSongs}
                playContext={{groupKey, list: orderedSongs}}
              />
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
