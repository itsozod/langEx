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
import { useUserSearchStore } from '@/screens/discover/store/user-search-store';
import { SearchTrigger } from '@/shared/components/search-overlay/search-trigger';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useTranslation } from 'react-i18next';
import { getLevelLabel } from '@/shared/constants/language-levels';

type Filter = 'all' | ProficiencyLevel;

const FILTERS: Filter[] = ['all', 'beginner', 'intermediate', 'advanced'];

export default function Discover() {
  const styles = useStyles();
  const { theme } = useAppTheme();
  const { t } = useTranslation(['discover', 'common']);
  const [filter, setFilter] = useState<Filter>('all');
  const isSearchOpen = useUserSearchStore((state) => state.isOpen);
  const openSearch = useUserSearchStore((state) => state.open);
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
            {t('title')}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {t('subtitle')}
          </ThemedText>
        </View>
      </View>

      <SearchTrigger
        accessibilityHint={t('search.openHint')}
        accessibilityLabel={t('openSearch')}
        hidden={isSearchOpen}
        onOpen={openSearch}
        placeholder={t('search.placeholder')}
      />

      <ScrollView
        horizontal
        contentContainerStyle={styles.filters}
        showsHorizontalScrollIndicator={false}>
        {FILTERS.map((item) => {
          const selected = filter === item;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(item)}
              style={({ pressed }) => [
                styles.filterPill,
                selected && styles.filterPillSelected,
                pressed && styles.pressed,
              ]}>
              <ThemedText style={[styles.filterText, selected && styles.filterTextSelected]}>
                {item === 'all' ? t('filters.all') : getLevelLabel(item)}
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
        {t('loadFailed')}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.stateMessage}>
        {query.error instanceof Error ? query.error.message : t('common:errors.tryAgain')}
      </ThemedText>
      <Pressable onPress={() => void query.refetch()} style={styles.retryButton}>
        <ThemedText style={styles.retryText}>{t('common:actions.tryAgain')}</ThemedText>
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
        {t('empty.title')}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.stateMessage}>
        {t('empty.message')}
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
