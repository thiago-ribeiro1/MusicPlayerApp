import {View, Text, TextInput} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import tw from 'twrnc';
import {FlashList} from '@shopify/flash-list';
import Wrapper from '../components/Wrapper';
import {useSongs} from '../hooks/useSongs';
import SongCard from '../components/SongCard';
import {FontsStyle} from '../styles/FontsStyle';
import styles from '../styles/SongsScreenStyle';
import GoBackButton from '../components/GoBackButton';

const SearchScreen = () => {
  const {songs} = useSongs();

  const [filteredSongs, setFilteredSongs] = useState(songs);
  const [searchTerm, setSearchTerm] = useState('');

  const filterSongs = useCallback(() => {
    if (searchTerm === '') {
      if (filteredSongs === songs) {
        return;
      } else {
        setFilteredSongs(songs);
      }
    } else {
      const queriedSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      setFilteredSongs(queriedSongs);
    }
  }, [searchTerm, songs, filteredSongs]);

  useEffect(() => {
    filterSongs();
  }, [searchTerm, songs]);

  return (
    <Wrapper backgroundColor="#080809">
      <View style={tw`flex-row px-5 gap-x-3 items-center pt-2`}>
        <GoBackButton />
      </View>

      <View style={tw`px-5 mt-8`}>
        <TextInput
          style={styles.searchInput}
          placeholder="search"
          placeholderTextColor="#A1A1AA"
          autoFocus
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <View style={tw`px-5 mt-8 gap-y-6 h-full`}>
        <Text style={FontsStyle.matchingSongs}>Matching songs</Text>

        {filteredSongs.length === 0 && (
          <Text style={tw`text-white-500 text-center text-base font-medium`}>
            Nothing here
          </Text>
        )}

        <FlashList
          data={filteredSongs}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({item, index}) => {
            return (
              <SongCard
                song={item}
                index={songs.findIndex(song => song.url === item.url)}
                allSongs={songs}
              />
            );
          }}
          estimatedItemSize={100}
        />
      </View>
    </Wrapper>
  );
};

export default SearchScreen;
