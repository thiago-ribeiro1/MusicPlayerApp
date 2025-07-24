import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080809',
    paddingHorizontal: 20,
  },
  contentScroll: {
    flex: 1,
  },
  searchSection: {
    marginTop: 10,
  },
  searchInput: {
    backgroundColor: '#1f2937',
    borderRadius: 100,
    paddingHorizontal: 20,
    height: 45,
    fontSize: 16,
    color: 'white',
  },
  tabsSection: {
    marginTop: 15,
    marginBottom: 10,
  },
  listContainer: {
    marginTop: 10,
    gap: 15,
  },
  placeholderText: {
    color: 'gray',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});
