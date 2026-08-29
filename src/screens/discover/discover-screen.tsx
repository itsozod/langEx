import { SymbolView } from '@/shared/components/ui/symbol-view';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/providers/theme-provider';
import { useDiscoverUsers } from '@/screens/discover/hooks';
import type { DiscoverUser, ProficiencyLevel } from '@/screens/discover/types';
import { UserCard, UserCardSkeleton } from '@/screens/discover/user-card';
import UserSearchScreen from '@/screens/discover/user-search-screen';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { ThemedText } from '@/shared/components/ui/themed-text';

type Filter = 'all' | ProficiencyLevel;

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

export default function Discover() {
  const styles = useStyles();
  const { theme } = useAppTheme();
  const [filter, setFilter] = useState<Filter>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const query = useDiscoverUsers(filter === 'all' ? undefined : filter);
  const users = useMemo(() => query.data?.pages.flatMap((page) => page.users) ?? [], [query.data]);

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <ThemedText type="title" style={styles.title}>
            Discover
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Find your next language partner
          </ThemedText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search users by username"
          onPress={() => setIsSearchOpen(true)}
          style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}>
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            size={25}
            weight="semibold"
            tintColor="#FFFFFF"
          />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        contentContainerStyle={styles.filters}
        showsHorizontalScrollIndicator={false}>
        {FILTERS.map((item) => {
          const selected = filter === item.value;
          return (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(item.value)}
              style={({ pressed }) => [
                styles.filterPill,
                selected && styles.filterPillSelected,
                pressed && styles.pressed,
              ]}>
              <ThemedText style={[styles.filterText, selected && styles.filterTextSelected]}>
                {item.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const empty = query.isPending ? (
    <View style={styles.skeletonList}>
      {Array.from({ length: 4 }, (_, index) => (
        <UserCardSkeleton key={index} />
      ))}
    </View>
  ) : query.isError ? (
    <View style={styles.stateCard}>
      <View style={styles.stateIcon}>
        <SymbolView
          name={{ ios: 'wifi.exclamationmark', android: 'wifi_off', web: 'wifi_off' }}
          size={28}
          tintColor={styles.stateIconColor.color}
        />
      </View>
      <ThemedText type="bold" style={styles.stateTitle}>
        Couldn&apos;t load partners
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.stateMessage}>
        {query.error instanceof Error ? query.error.message : 'Please try again.'}
      </ThemedText>
      <Pressable onPress={() => void query.refetch()} style={styles.retryButton}>
        <ThemedText style={styles.retryText}>Try again</ThemedText>
      </Pressable>
    </View>
  ) : (
    <View style={styles.stateCard}>
      <View style={styles.stateIcon}>
        <SymbolView
          name={{ ios: 'person.2.slash', android: 'person_off', web: 'person_off' }}
          size={30}
          tintColor={styles.stateIconColor.color}
        />
      </View>
      <ThemedText type="bold" style={styles.stateTitle}>
        No partners yet
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.stateMessage}>
        No language partners found. Try changing your languages in your profile.
      </ThemedText>
    </View>
  );

  return (
    <View style={styles.screen}>
      <GradientBackground>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <FlatList<DiscoverUser>
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <UserCard user={item} />}
            ListHeaderComponent={header}
            ListEmptyComponent={empty}
            ListFooterComponent={
              query.isFetchingNextPage ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator color="#7460D3" />
                </View>
              ) : null
            }
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                refreshing={query.isRefetching && !query.isFetchingNextPage}
                onRefresh={() => void query.refetch()}
                tintColor={theme === 'dark' ? '#B8A9FF' : '#6654C7'}
              />
            }
          />
        </SafeAreaView>
      </GradientBackground>
      {isSearchOpen ? <UserSearchScreen onClose={() => setIsSearchOpen(false)} /> : null}
    </View>
  );
}

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    screen: { flex: 1 },
    safeArea: { flex: 1, width: '100%' },
    content: {
      flexGrow: 1,
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      paddingHorizontal: 20,
      paddingBottom: 120,
    },
    header: { paddingTop: 16, paddingBottom: 20, gap: 20 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    titleCopy: { flex: 1, minWidth: 0, paddingRight: 12 },
    title: { fontSize: 32, lineHeight: 39 },
    subtitle: { fontSize: 13, lineHeight: 20, marginTop: 3 },
    searchButton: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 17,
      borderCurve: 'continuous',
      backgroundColor: '#6B57CA',
      boxShadow: '0 8px 18px rgba(82,61,173,0.28)',
    },
    filters: { gap: 9, paddingRight: 8 },
    filterPill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.10)' : '#E1DDE8',
      paddingHorizontal: 16,
      paddingVertical: 9,
      backgroundColor: isDark ? 'rgba(35, 30, 48, 0.8)' : 'rgba(255,255,255,0.80)',
    },
    filterPillSelected: { backgroundColor: '#6654C7', borderColor: '#6654C7' },
    filterText: {
      color: isDark ? '#C3BDCE' : '#665F70',
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '600',
    },
    filterTextSelected: { color: '#FFFFFF' },
    pressed: { opacity: 0.75 },
    skeletonList: {},
    stateCard: {
      marginTop: 32,
      alignItems: 'center',
      borderRadius: 24,
      paddingHorizontal: 26,
      paddingVertical: 38,
      backgroundColor: isDark ? 'rgba(38,32,52,0.92)' : 'rgba(255,255,255,0.92)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(190,176,255,0.12)' : 'rgba(97,76,190,0.09)',
    },
    stateIcon: {
      width: 58,
      height: 58,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      backgroundColor: isDark ? 'rgba(130,108,235,0.15)' : '#F0EBFF',
    },
    stateIconColor: { color: isDark ? '#B9ABFF' : '#6654C7' },
    stateTitle: { fontSize: 17, lineHeight: 23, marginBottom: 7 },
    stateMessage: { textAlign: 'center', fontSize: 13, lineHeight: 20 },
    retryButton: {
      marginTop: 18,
      borderRadius: 999,
      paddingHorizontal: 18,
      paddingVertical: 10,
      backgroundColor: '#6654C7',
    },
    retryText: { color: '#FFFFFF', fontSize: 12, lineHeight: 17, fontWeight: '700' },
    footerLoader: { paddingVertical: 24 },
  });
};
