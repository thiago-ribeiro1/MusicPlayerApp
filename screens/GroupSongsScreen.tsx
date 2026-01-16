import React, {useEffect, useRef} from 'react';
import {View, Text, FlatList, StatusBar} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {SongType} from '../types';
import {
  State,
  useActiveTrack,
  usePlaybackState,
} from 'react-native-track-player';
import {useFavourties} from '../hooks/useFavourites';
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

  const {favourites, setFavourites} = useFavourties();
  const favouritesRef = useRef<SongType[]>(favourites);
  useEffect(() => {
    favouritesRef.current = favourites;
  }, [favourites]);

  // 1x por tela (performance)
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const activeUrl = activeTrack?.url ?? null;
  const isPlaying = playbackState.state === State.Playing;

  // Set de favoritos (rápido e estável)
  const favSet = React.useMemo(
    () => new Set(favourites.map(f => f.url)),
    [favourites],
  );

  const onToggleFavourite = React.useCallback(
    async (song: SongType) => {
      if (!song.url) return;

      const current = favouritesRef.current;
      const exists = current.some(f => f.url === song.url);

      const next = exists
        ? current.filter(f => f.url !== song.url)
        : [...current, song];

      await setFavourites(next);
    },
    [setFavourites],
  );

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
                activeUrl={activeUrl}
                isPlaying={isPlaying}
                isFavourite={favSet.has(item.url)}
                onToggleFavourite={onToggleFavourite}
              />
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
