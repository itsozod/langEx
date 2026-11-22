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

import { useDiscoverUsers } from '@/screens/discover/hooks';
import type { DiscoverUser, ProficiencyLevel } from '@/screens/discover/types';
import { USER_CARD_TEXT_INSET, UserCard, UserCardSkeleton } from '@/screens/discover/user-card';
import { useUserSearchStore } from '@/screens/discover/store/user-search-store';
import { SearchTrigger } from '@/shared/components/search-overlay/search-trigger';
import { FilterChip } from '@/shared/components/ui/filter-chip';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useTranslation } from 'react-i18next';
import { getLevelLabel } from '@/shared/constants/language-levels';
import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';

const GUTTER = 20;

type Filter = 'all' | ProficiencyLevel;

const FILTERS: Filter[] = ['all', 'beginner', 'intermediate', 'advanced'];

export default function Discover() {
  const styles = useStyles();
  const tokens = useUiTokens();
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
      <ThemedText accessibilityRole="header" style={styles.title}>
        {t('title')}
      </ThemedText>

      <SearchTrigger
        accessibilityHint={t('search.openHint')}
        accessibilityLabel={t('openSearch')}
        hidden={isSearchOpen}
        onOpen={openSearch}
        placeholder={t('search.placeholder')}
      />

      <ScrollView
        horizontal
        accessibilityRole="radiogroup"
        contentContainerStyle={styles.filters}
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroller}>
        {FILTERS.map((item) => (
          <FilterChip
            key={item}
            label={item === 'all' ? t('filters.all') : getLevelLabel(item)}
            onPress={() => setFilter(item)}
            selected={filter === item}
          />
        ))}
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
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={header}
            ListEmptyComponent={empty}
            ListFooterComponent={
              query.isFetchingNextPage ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator color={tokens.loader} />
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
                tintColor={tokens.loader}
              />
            }
          />
        </SafeAreaView>
      </GradientBackground>
    </View>
  );
}

const useStyles = () => {
  const tokens = useUiTokens();

  return StyleSheet.create({
    screen: { flex: 1 },
    safeArea: { flex: 1, width: '100%' },
    content: {
      flexGrow: 1,
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      paddingBottom: 120,
    },
    // Header keeps the page gutter; partner rows run edge to edge for the press state.
    header: { paddingHorizontal: GUTTER, paddingTop: 12, paddingBottom: 8, gap: 14 },
    title: {
      color: tokens.text,
      fontFamily: FONT.bold,
      fontSize: 32,
      lineHeight: 38,
      letterSpacing: -0.6,
    },
    filtersScroller: { marginHorizontal: -GUTTER },
    filters: { gap: 8, paddingHorizontal: GUTTER },
    separator: {
      height: StyleSheet.hairlineWidth,
      marginLeft: USER_CARD_TEXT_INSET,
      backgroundColor: tokens.hairline,
    },
    skeletonList: {},
    stateCard: {
      marginTop: 56,
      marginHorizontal: GUTTER,
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    stateIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      backgroundColor: tokens.fill,
    },
    stateIconColor: { color: tokens.muted },
    stateTitle: { color: tokens.text, fontSize: 17, lineHeight: 23, marginBottom: 6 },
    stateMessage: { maxWidth: 280, textAlign: 'center', fontSize: 14, lineHeight: 20 },
    retryButton: {
      marginTop: 20,
      borderRadius: 999,
      paddingHorizontal: 18,
      paddingVertical: 10,
      backgroundColor: tokens.accent,
    },
    retryText: { color: tokens.onAccent, fontFamily: FONT.semibold, fontSize: 14, lineHeight: 19 },
    footerLoader: { paddingVertical: 24 },
  });
};
