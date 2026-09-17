import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  ChartBarIcon,
  HeartIcon,
  MusicalNoteIcon,
} from 'react-native-heroicons/solid';

import SongsScreen from '../screens/SongsScreen';
import FavouritesScreen from '../screens/FavouritesScreen';
import InsightsScreen from '../screens/InsightsScreen';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {tabBarHidden} from '../hooks/useTabBarScroll';

const Tabs = createBottomTabNavigator();

const TAB_BAR_CONTENT_HEIGHT = 49;

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          borderColor: '#6b7280',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          transform: [
            {
              translateY: tabBarHidden.interpolate({
                inputRange: [0, 1],
                outputRange: [0, TAB_BAR_CONTENT_HEIGHT + insets.bottom],
              }),
            },
          ],
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
