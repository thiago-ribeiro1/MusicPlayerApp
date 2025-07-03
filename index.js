/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App'; // importar o componente principal do aplicativo
import {name as appName} from './app.json';
import TrackPlayer from 'react-native-track-player';

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(() => require('./service'));
