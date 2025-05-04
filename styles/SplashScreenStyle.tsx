import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  background: { 
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#0F0817',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 2,
  },
  girl: {
    marginTop: 60,
    width: 257,
    height: 385,
    alignSelf: 'center',
    zIndex: 1,
  },
  logo: {
    marginTop: -225,
    width: 370,
    height: 370,
    alignSelf: 'center',
    zIndex: 3,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
    marginBottom: 55,
  },
});
