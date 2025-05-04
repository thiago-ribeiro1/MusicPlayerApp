import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {SongType} from '../types';

type UseFavouritesType = {
  favourites: SongType[];
  setFavourites: (favourites: SongType[]) => Promise<void>;
  getFavourites: () => Promise<void>;
};

export const useFavourties = create<UseFavouritesType>(set => ({
  favourites: [],
  setFavourites: async favourites => {
    await AsyncStorage.setItem('favourites', JSON.stringify(favourites));
    set({favourites});
  },
  getFavourites: async () => {
    const storedFavourites = await AsyncStorage.getItem('favourites');
    if (storedFavourites) {
      set({favourites: JSON.parse(storedFavourites)});
    }
  },
}));
