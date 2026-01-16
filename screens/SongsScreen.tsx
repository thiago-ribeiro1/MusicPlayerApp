import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  State,
  useActiveTrack,
  usePlaybackState,
} from 'react-native-track-player';
import {useFavourties} from '../hooks/useFavourites';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FlashList} from '@shopify/flash-list';
import Header from '../components/Header';
import SongCard from '../components/SongCard';
import Player from '../components/Player';
import {useSongs} from '../hooks/useSongs';
import {TabsHeader} from '../components/TabsHeader';
import styles from '../styles/SongsScreenStyle';
import {FontsStyle} from '../styles/FontsStyle';
import {SongType} from '../types';

const SongsScreen = () => {
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'SONGS' | 'ALBUMS' | 'FOLDERS'>(
    'SONGS',
  );
  const {songs, loadMoreSongs, isLoading, limitExceeded} = useSongs();
  const [hasShownLimitModal, setHasShownLimitModal] = useState(false);
  const hasDismissedLimitModal = useRef(false);
  const insets = useSafeAreaInsets();

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

  useEffect(() => {
    loadMoreSongs(); // Carrega os primeiros 10 paginação
  }, []);

  // Filtra e agrupa as músicas por álbum
  const albums = songs.reduce((acc, song) => {
    if (song.album) {
      if (!acc[song.album]) acc[song.album] = [];
      acc[song.album].push(song);
    }
    return acc;
  }, {} as Record<string, SongType[]>);

  // Ordena cada grupo por trackNumber
  Object.keys(albums).forEach(album => {
    albums[album].sort((a, b) => {
      if (!a.trackNumber) return 1;
      if (!b.trackNumber) return -1;
      return a.trackNumber - b.trackNumber;
    });
  });

  // Filtra e agrupa as músicas por pasta
  const folders = songs.reduce((acc, song) => {
    if (song.folder) {
      if (!acc[song.folder]) acc[song.folder] = [];
      acc[song.folder].push(song);
    }
    return acc;
  }, {} as Record<string, SongType[]>);

  Object.keys(folders).forEach(folder => {
    folders[folder].sort((a, b) => {
      if (!a.trackNumber) return 1;
      if (!b.trackNumber) return -1;
      return a.trackNumber - b.trackNumber;
    });
  });

  const handleSearch = (text: string) => {
    setSearchText(text);
    navigation.navigate('Search');
  };

  const AlbumCard = ({title, songs}: {title: string; songs: SongType[]}) => (
    <Pressable
      onPress={() => navigation.navigate('GroupSongsScreen', {title, songs})}
      style={{
        marginVertical: 8,
        padding: 10,
        backgroundColor: '#111',
        borderRadius: 8,
      }}>
      <Text style={FontsStyle.albumTitle}>{title}</Text>
      {/* imagem do primeiro item como capa */}
      {songs[0].cover ? (
        <Image
          source={{uri: songs[0].cover}}
          style={{width: 60, height: 60, marginTop: 5}}
        />
      ) : null}
      <Text style={{color: '#aaa', fontSize: 12}}>{songs.length} songs</Text>
    </Pressable>
  );

  const FolderCard = ({path, songs}: {path: string; songs: SongType[]}) => (
    <Pressable
      onPress={() =>
        navigation.navigate('GroupSongsScreen', {
          title: path.split('/').pop() || 'Folder',
          songs,
        })
      }
      style={{
        marginVertical: 8,
        padding: 10,
        backgroundColor: '#111',
        borderRadius: 8,
      }}>
      <Text style={FontsStyle.folderTitle}>{path.split('/').pop()}</Text>

      {/* Ícone fixo da pasta */}
      <Image
        source={require('../assets/folder.png')}
        style={{width: 60, height: 60, marginTop: 5, resizeMode: 'contain'}}
      />
      <Text style={{color: '#aaa', fontSize: 12}}>{songs.length} songs</Text>
    </Pressable>
  );

  // Agrupamento em lista única respeitando ordem dos álbuns
  const orderedByAlbum: SongType[] = Object.entries(albums)
    .sort((a, b) => a[0].localeCompare(b[0])) // ordena os álbuns por nome
    .flatMap(([_, songs]) => songs);

  useEffect(() => {
    if (limitExceeded && !hasDismissedLimitModal.current) {
      setHasShownLimitModal(true);
      hasDismissedLimitModal.current = true;
    }
  }, [limitExceeded]);

  const renderContent = () => {
    switch (activeTab) {
      case 'SONGS':
        return (
          <View style={styles.listContainer}>
            {songs.length === 0 ? (
              <Text style={styles.placeholderText}>Nothing here</Text>
            ) : (
              <FlashList
                data={orderedByAlbum}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({item, index}) => (
                  <SongCard
                    song={item}
                    index={index}
                    allSongs={orderedByAlbum}
                    activeUrl={activeUrl}
                    isPlaying={isPlaying}
                    isFavourite={favSet.has(item.url)}
                    onToggleFavourite={onToggleFavourite}
                  />
                )}
                estimatedItemSize={80}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMoreSongs}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="#aaa"
                      style={{marginTop: 10}}
                    />
                  ) : null
                }
                contentContainerStyle={{paddingBottom: 20}}
              />
            )}
          </View>
        );

      case 'ALBUMS':
        return (
          <View style={styles.listContainer}>
            {Object.keys(albums).length === 0 ? (
              <Text style={styles.placeholderText}>No albums found</Text>
            ) : (
              Object.entries(albums).map(([albumName, songs]) => (
                <AlbumCard key={albumName} title={albumName} songs={songs} />
              ))
            )}
          </View>
        );

      case 'FOLDERS':
        return (
          <View style={styles.listContainer}>
            {Object.keys(folders).length === 0 ? (
              <Text style={styles.placeholderText}>
                No music directory found
              </Text>
            ) : (
              Object.entries(folders).map(([path, songs]) => (
                <FolderCard key={path} path={path} songs={songs} />
              ))
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <View // status bar camada visual
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + 5,
          backgroundColor: 'rgba(0,0,0,0.45)',
          zIndex: 5,
        }}
      />

      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <View style={{flex: 1, backgroundColor: '#080809'}}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top,
            paddingBottom: 100,
            paddingHorizontal: 20,
          }}>
          <Header title="Music Player" />

          {/* SearchBar */}
          <Pressable
            style={styles.searchSection}
            onPress={() => navigation.navigate('Search')}>
            <TextInput
              style={styles.searchInput}
              placeholder="search"
              placeholderTextColor="#A1A1AA"
              editable={false}
              value={searchText}
              onChangeText={handleSearch}
            />
          </Pressable>

          {/* TabsHeader */}
          <View style={styles.tabsSection}>
            <TabsHeader
              active={activeTab}
              options={['SONGS', 'ALBUMS', 'FOLDERS']}
              onSelect={tab => setActiveTab(tab as any)}
            />
          </View>

          {/* Songs list */}
          {renderContent()}
        </ScrollView>

        {hasShownLimitModal && (
          <View
            style={{
              position: 'absolute',
              top: 120,
              left: 30,
              right: 30,
              padding: 20,
              backgroundColor: '#111827',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#1684D9',
              zIndex: 999,
              elevation: 10,
            }}>
            <Text style={[FontsStyle.limitModalTitle]}>
              Song limit exceeded
            </Text>
            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 14,
                textAlign: 'center',
              }}>
              Only loading 100 songs
            </Text>
            <Pressable
              onPress={() => setHasShownLimitModal(false)}
              style={{
                marginTop: 15,
                backgroundColor: '#1684D9',
                borderRadius: 8,
                paddingVertical: 8,
              }}>
              <Text
                style={{
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}>
                OK
              </Text>
            </Pressable>
          </View>
        )}

        <Player />
      </View>
    </>
  );
};

export default SongsScreen;
