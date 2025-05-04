import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TabsHeaderProps {
  active: 'SONGS' | 'ALBUMS' | 'PLAYLISTS' | 'FOLDERS';
  options: string[];
  onSelect: (tab: 'SONGS' | 'ALBUMS' | 'PLAYLISTS' | 'FOLDERS') => void;
}

export const TabsHeader: React.FC<TabsHeaderProps> = ({ active, options, onSelect }) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = active === option;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onSelect(option as any)}
            style={styles.tab}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {option}
            </Text>
            {isActive && <View style={styles.activeUnderline} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  tab: {
    alignItems: 'center',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#1684D9',
  },
  activeUnderline: {
    marginTop: 5,
    height: 2,
    width: 30,
    backgroundColor: '#1684D9',
    borderRadius: 1,
  },
});
