import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, Pressable, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import Wrapper from '../components/Wrapper';
import Header from '../components/Header';
import SongCard from '../components/SongCard';
import Player from '../components/Player';
import { useSongs } from '../hooks/useSongs';
import { TabsHeader } from '../components/TabsHeader';
import styles from '../styles/SongsScreenStyle';

const SongsScreen = () => {
  const { songs } = useSongs();
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'SONGS' | 'ALBUMS' | 'PLAYLISTS' | 'FOLDERS'>('SONGS');

  const handleSearch = (text: string) => {
    setSearchText(text);
    navigation.navigate('Search');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'SONGS':
        return (
          <View style={styles.listContainer}>
            {songs.length === 0 ? (
              <Text style={styles.placeholderText}>Nothing here.</Text>
            ) : (
              <FlashList
                data={songs}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item, index }) => (
                  <SongCard song={item} index={index} />
                )}
                estimatedItemSize={80}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        );
      default:
        return (
          <View style={styles.listContainer}>
            <Text style={styles.placeholderText}>No {activeTab.toLowerCase()} available yet.</Text>
          </View>
        );
    }
  };

  return (
    <Wrapper backgroundColor="#080809">
      <View style={styles.container}>
        <StatusBar backgroundColor="#080809" barStyle="light-content" />
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <Header title="Music Player" />

          {/* SearchBar */}
          <Pressable style={styles.searchSection} onPress={() => navigation.navigate('Search')}>
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
              options={['SONGS', 'ALBUMS', 'PLAYLISTS', 'FOLDERS']}
              onSelect={(tab) => setActiveTab(tab as any)}
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
