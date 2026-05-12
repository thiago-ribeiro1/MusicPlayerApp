import React, {useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  StyleSheet,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  MusicalNoteIcon,
  UserIcon,
  ClockIcon,
  FolderIcon,
  InformationCircleIcon,
  SpeakerWaveIcon,
  RectangleStackIcon,
  AdjustmentsHorizontalIcon,
} from 'react-native-heroicons/solid';
import Player from '../components/Player';
import {useSongs} from '../hooks/useSongs';
import type {SongType} from '../types';

const ACCENT = '#1684D9';
const BG_PRIMARY = '#080809';
const BG_CARD = '#080F18';
const ICON_BG = 'rgba(22,132,217,0.12)';
const TEXT_SECONDARY = '#A1A1AA';
const SEPARATOR = 'rgba(255,255,255,0.07)';

// --- Helpers ---

function normalizeText(value?: string | null): string {
  return String(value ?? '').trim();
}

function isUnknownValue(value?: string | null): boolean {
  const normalized = normalizeText(value).toLowerCase();
  return (
    !normalized ||
    normalized === '<unknown>' ||
    normalized === 'unknown' ||
    normalized === 'unknown artist' ||
    normalized === 'unknown album' ||
    normalized === 'unknown title' ||
    normalized === 'desconhecido'
  );
}

function normalizeDurationMs(duration: unknown): number {
  const value = Number(duration);
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  // duração normalizada em segundos
  return Math.floor(value / 1000);
}

function formatTrackDuration(seconds: number): string {
  if (!seconds || seconds <= 0) {
    return '0:00';
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(
      secs,
    ).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function formatTotalDuration(seconds: number): string {
  if (!seconds || seconds <= 0) {
    return '0m';
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function getFolderName(folder: string): string {
  if (!folder) {
    return '';
  }
  return folder.split('/').pop() || folder;
}

// --- Insights cálculos ---

type LibraryInsights = {
  totalSongs: number;
  totalArtists: number;
  totalAlbums: number;
  totalDurationLabel: string;
  topArtist: {name: string; subtitle: string; artwork?: string};
  topAlbum: {name: string; subtitle: string; artwork?: string};
  longestTrack: {title: string; durationLabel: string};
  largestFolder: {name: string; subtitle: string};
  unknownMetadata: {title: string; subtitle: string};
};

function calculateLibraryInsights(songs: SongType[]): LibraryInsights {
  if (!Array.isArray(songs) || songs.length === 0) {
    return {
      totalSongs: 0,
      totalArtists: 0,
      totalAlbums: 0,
      totalDurationLabel: '0m',
      topArtist: {name: 'Unknown Artist', subtitle: 'No artist data'},
      topAlbum: {name: 'Unknown Album', subtitle: 'No album data'},
      longestTrack: {title: 'No duration data', durationLabel: '0:00'},
      largestFolder: {name: 'Unknown Folder', subtitle: 'No folder data'},
      unknownMetadata: {
        title: '0 incomplete tracks',
        subtitle: 'All metadata looks good',
      },
    };
  }

  const totalSongs = songs.length;

  const validArtists = new Set<string>();
  songs.forEach(s => {
    if (!isUnknownValue(s.artist)) {
      validArtists.add(normalizeText(s.artist));
    }
  });
  const totalArtists = validArtists.size;

  const validAlbums = new Set<string>();
  songs.forEach(s => {
    if (!isUnknownValue(s.album)) {
      validAlbums.add(normalizeText(s.album));
    }
  });
  const totalAlbums = validAlbums.size;

  const totalSeconds = songs.reduce(
    (acc, s) => acc + normalizeDurationMs(s.duration),
    0,
  );
  const totalDurationLabel = formatTotalDuration(totalSeconds);

  const artistMap: Record<string, {count: number; artwork?: string}> = {};
  songs.forEach(s => {
    if (!isUnknownValue(s.artist)) {
      const key = normalizeText(s.artist);
      if (!artistMap[key]) {
        artistMap[key] = {count: 0, artwork: s.cover || undefined};
      }
      artistMap[key].count++;
      if (!artistMap[key].artwork && s.cover) {
        artistMap[key].artwork = s.cover;
      }
    }
  });
  const topArtistEntry = Object.entries(artistMap).sort(
    (a, b) => b[1].count - a[1].count,
  )[0];
  const topArtist = topArtistEntry
    ? {
        name: topArtistEntry[0],
        subtitle:
          topArtistEntry[1].count === 1
            ? '1 song in library'
            : `${topArtistEntry[1].count} songs in library`,
        artwork: topArtistEntry[1].artwork,
      }
    : {name: 'Unknown Artist', subtitle: 'No artist data'};

  const albumMap: Record<string, {count: number; artwork?: string}> = {};
  songs.forEach(s => {
    if (!isUnknownValue(s.album)) {
      const key = normalizeText(s.album);
      if (!albumMap[key]) {
        albumMap[key] = {count: 0, artwork: s.cover || undefined};
      }
      albumMap[key].count++;
      if (!albumMap[key].artwork && s.cover) {
        albumMap[key].artwork = s.cover;
      }
    }
  });
  const topAlbumEntry = Object.entries(albumMap).sort(
    (a, b) => b[1].count - a[1].count,
  )[0];
  const topAlbum = topAlbumEntry
    ? {
        name: topAlbumEntry[0],
        subtitle:
          topAlbumEntry[1].count === 1
            ? '1 track'
            : `${topAlbumEntry[1].count} tracks`,
        artwork: topAlbumEntry[1].artwork,
      }
    : {name: 'Unknown Album', subtitle: 'No album data'};

  let longestSong: SongType | null = null;
  songs.forEach(s => {
    const dur = normalizeDurationMs(s.duration);
    if (dur > 0) {
      if (!longestSong || dur > normalizeDurationMs(longestSong.duration)) {
        longestSong = s;
      }
    }
  });
  const longestTrack = longestSong
    ? {
        title: (longestSong as SongType).title,
        durationLabel: formatTrackDuration(
          normalizeDurationMs((longestSong as SongType).duration),
        ),
      }
    : {title: 'No duration data', durationLabel: '0:00'};

  const folderMap: Record<string, number> = {};
  songs.forEach(s => {
    if (s.folder) {
      const name = getFolderName(s.folder);
      if (name) {
        folderMap[name] = (folderMap[name] || 0) + 1;
      }
    }
  });
  const topFolderEntry = Object.entries(folderMap).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const largestFolder = topFolderEntry
    ? {
        name: topFolderEntry[0],
        subtitle:
          topFolderEntry[1] === 1 ? '1 song' : `${topFolderEntry[1]} songs`,
      }
    : {name: 'Unknown Folder', subtitle: 'No folder data'};

  const unknownCount = songs.filter(
    s =>
      isUnknownValue(s.artist) ||
      isUnknownValue(s.album) ||
      isUnknownValue(s.title),
  ).length;
  const unknownMetadata =
    unknownCount === 0
      ? {
          title: '0 incomplete tracks',
          subtitle: 'All metadata looks good',
        }
      : unknownCount === 1
      ? {
          title: '1 incomplete track',
          subtitle: 'Missing artist, album or title',
        }
      : {
          title: `${unknownCount} incomplete tracks`,
          subtitle: 'Missing artist, album or title',
        };

  return {
    totalSongs,
    totalArtists,
    totalAlbums,
    totalDurationLabel,
    topArtist,
    topAlbum,
    longestTrack,
    largestFolder,
    unknownMetadata,
  };
}

const InsightsScreen = () => {
  const insets = useSafeAreaInsets();
  const {songs} = useSongs();

  const insights = useMemo(() => calculateLibraryInsights(songs), [songs]);

  const insightStats = [
    {label: 'Songs', value: String(insights.totalSongs), Icon: MusicalNoteIcon},
    {label: 'Artists', value: String(insights.totalArtists), Icon: UserIcon},
    {
      label: 'Albums',
      value: String(insights.totalAlbums),
      Icon: RectangleStackIcon,
    },
    {
      label: 'Total Duration',
      value: insights.totalDurationLabel,
      Icon: ClockIcon,
    },
  ];

  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + 5,
          backgroundColor: 'rgba(0,0,0,0.45)',
          zIndex: 5,
        }}
      />
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <View style={{flex: 1, backgroundColor: BG_PRIMARY}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top,
            paddingBottom: 100,
            paddingHorizontal: 20,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 8,
            }}>
            <Text
              style={{
                fontSize: 22,
                color: 'white',
                fontFamily: 'ClashGrotesk-Bold',
              }}>
              Insights
            </Text>
            <AdjustmentsHorizontalIcon color="white" size={24} />
          </View>

          <Text style={styles.subtitle}>Your music at a glance</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              {insightStats.slice(0, 2).map(({label, value, Icon}) => (
                <View key={label} style={styles.statCard}>
                  <Icon color={ACCENT} size={22} />
                  <Text style={styles.statValue}>{value}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.statsRow}>
              {insightStats.slice(2, 4).map(({label, value, Icon}) => (
                <View key={label} style={styles.statCard}>
                  <Icon color={ACCENT} size={22} />
                  <Text style={styles.statValue}>{value}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Top Artist</Text>
          <View style={styles.featureCard}>
            {insights.topArtist.artwork ? (
              <Image
                source={{uri: insights.topArtist.artwork}}
                style={styles.avatarCircle}
              />
            ) : (
              <View style={styles.avatarCircle}>
                <UserIcon color={ACCENT} size={24} />
              </View>
            )}
            <View style={styles.featureInfo}>
              <Text
                style={styles.featureTitle}
                numberOfLines={1}
                ellipsizeMode="tail">
                {insights.topArtist.name}
              </Text>

              <Text
                style={styles.featureSub}
                numberOfLines={1}
                ellipsizeMode="tail">
                {insights.topArtist.subtitle}
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, {marginTop: 20}]}>Top Album</Text>
          <View style={styles.featureCard}>
            {insights.topAlbum.artwork ? (
              <Image
                source={{uri: insights.topAlbum.artwork}}
                style={styles.albumSquare}
              />
            ) : (
              <View style={styles.albumSquare}>
                <MusicalNoteIcon color={ACCENT} size={22} />
              </View>
            )}
            <View style={styles.featureInfo}>
              <Text
                style={styles.featureTitle}
                numberOfLines={1}
                ellipsizeMode="tail">
                {insights.topAlbum.name}
              </Text>

              <Text
                style={styles.featureSub}
                numberOfLines={1}
                ellipsizeMode="tail">
                {insights.topAlbum.subtitle}
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, {marginTop: 20}]}>
            Library Highlights
          </Text>
          <View style={styles.highlightsCard}>
            <View style={styles.highlightRow}>
              <View style={styles.highlightIcon}>
                <SpeakerWaveIcon color={ACCENT} size={17} />
              </View>
              <View style={styles.highlightInfo}>
                <Text style={styles.highlightLabel}>Longest Track</Text>
                <Text style={styles.highlightValue} numberOfLines={1}>
                  {insights.longestTrack.title}
                </Text>
              </View>
              <Text style={styles.highlightMeta}>
                {insights.longestTrack.durationLabel}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.highlightRow}>
              <View style={styles.highlightIcon}>
                <FolderIcon color={ACCENT} size={17} />
              </View>
              <View style={styles.highlightInfo}>
                <Text style={styles.highlightLabel}>Largest Folder</Text>
                <Text style={styles.highlightValue} numberOfLines={1}>
                  {insights.largestFolder.name}
                </Text>
              </View>
              <Text style={styles.highlightMeta}>
                {insights.largestFolder.subtitle}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.highlightRow}>
              <View style={styles.highlightIcon}>
                <InformationCircleIcon color={ACCENT} size={17} />
              </View>
              <View style={styles.highlightInfo}>
                <Text style={styles.highlightLabel}>Unknown Metadata</Text>
                <Text style={styles.highlightValue} numberOfLines={1}>
                  {insights.unknownMetadata.title}
                </Text>
                <Text style={styles.highlightSub} numberOfLines={1}>
                  {insights.unknownMetadata.subtitle}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <Player />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 20,
  },
  statsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: BG_CARD,
    borderRadius: 16,
    padding: 16,
  },
  statValue: {
    fontFamily: 'ClashGrotesk-Bold',
    color: 'white',
    fontSize: 22,
    marginTop: 10,
    marginBottom: 2,
  },
  statLabel: {
    color: TEXT_SECONDARY,
    fontWeight: '500',
    fontSize: 12,
  },
  sectionTitle: {
    fontFamily: 'ClashGrotesk-Bold',
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  featureCard: {
    backgroundColor: BG_CARD,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumSquare: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'ClashGrotesk-Bold',
    color: 'white',
    fontSize: 15,
  },
  featureSub: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  highlightsCard: {
    backgroundColor: BG_CARD,
    borderRadius: 16,
    overflow: 'hidden',
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  highlightIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightInfo: {
    flex: 1,
  },
  highlightLabel: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  highlightValue: {
    fontFamily: 'ClashGrotesk-Bold',
    color: 'white',
    fontSize: 13,
  },
  highlightSub: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  highlightMeta: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '500',
    marginRight: 2,
  },
  separator: {
    height: 1,
    backgroundColor: SEPARATOR,
    marginHorizontal: 14,
  },
});

export default InsightsScreen;
