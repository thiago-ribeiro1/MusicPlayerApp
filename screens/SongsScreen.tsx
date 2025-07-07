import React, {useState, useEffect} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import Wrapper from '../components/Wrapper';
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
  const {songs, loadMoreSongs, isLoading} = useSongs();

  useEffect(() => {
    loadMoreSongs(); // Carrega os primeiros 10 paginação
  }, []);

  const albums = songs.reduce((acc, song) => {
    if (song.album) {
      if (!acc[song.album]) acc[song.album] = [];
      acc[song.album].push(song);
    }
    return acc;
  }, {} as Record<string, SongType[]>);

  const folders = songs.reduce((acc, song) => {
    if (song.folder) {
      if (!acc[song.folder]) acc[song.folder] = [];
      acc[song.folder].push(song);
    }
    return acc;
  }, {} as Record<string, SongType[]>);

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

  const renderContent = () => {
    switch (activeTab) {
      case 'SONGS':
        return (
          <View style={styles.listContainer}>
            {songs.length === 0 ? (
              <Text style={styles.placeholderText}>Nothing here</Text>
            ) : (
              <FlashList
                data={songs}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({item, index}) => (
                  <SongCard song={item} index={index} />
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
    <Wrapper backgroundColor="#080809">
      <View style={styles.container}>
        <StatusBar backgroundColor="#080809" barStyle="light-content" />
        <ScrollView contentContainerStyle={{paddingBottom: 100}}>
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
      </View>

      {/* MiniPlayer */}
      <Player />
    </Wrapper>
  );
};

export default SongsScreen;
