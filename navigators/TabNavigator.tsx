import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  ChartBarIcon,
  HeartIcon,
  MusicalNoteIcon,
} from 'react-native-heroicons/solid';

import SongsScreen from '../screens/SongsScreen';
import FavouritesScreen from '../screens/FavouritesScreen';
import InsightsScreen from '../screens/InsightsScreen';

const Tabs = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          borderColor: '#6b7280',
        },
        tabBarActiveTintColor: '#1684D9',
        tabBarInactiveTintColor: '#6b7280',
      }}>
      <Tabs.Screen
        name="Songs"
        component={SongsScreen}
        options={{
          tabBarIcon: ({color, size}) => {
            return <MusicalNoteIcon color={color} size={size} />;
          },
        }}
      />

      <Tabs.Screen
        name="Favorites"
        component={FavouritesScreen}
        options={{
          tabBarIcon: ({color, size}) => {
            return <HeartIcon color={color} size={size} />;
          },
        }}
      />

      <Tabs.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarIcon: ({color, size}) => {
            return <ChartBarIcon color={color} size={size} />;
          },
        }}
      />
    </Tabs.Navigator>
  );
};

export default TabNavigator;
