import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, View, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GradientBackground from '@/shared/components/ui/gradient-background';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useUserStore } from '@/shared/store/user.store';

import {
  ConversationRow,
  ConversationSkeleton,
  getOtherParticipant,
} from './components/conversation-row';
import { ChatListFilterEmptyState, ChatListFilters } from './components/chat-list-filters';
import { useConversations } from './hooks';
import { useChatListFilters } from './hooks/use-chat-list-filters';
import { useChatSearchStore } from './store/chat-search-store';
import { useChatsStyles } from './styles/chats-styles';
import type { Conversation } from './types/message.types';
import { useTranslation } from 'react-i18next';
import { useUiTokens } from '@/shared/hooks/use-ui-tokens';

export default function ChatsScreen() {
  const styles = useChatsStyles();
  const tokens = useUiTokens();
  const { t } = useTranslation(['chat', 'common']);
  const userId = useUserStore((state) => state.user?.id);
  const query = useConversations();
  const filters = useChatListFilters();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const openSearch = useChatSearchStore((state) => state.open);
  const isSearchOpen = useChatSearchStore((state) => state.isOpen);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await (filters.isFiltering ? filters.filteredQuery.refetch() : query.refetch());
    } finally {
      setIsRefreshing(false);
    }
  }, [filters.filteredQuery, filters.isFiltering, query]);

  const renderConversation: ListRenderItem<Conversation> = ({ item }) => {
    const participant = getOtherParticipant(item, userId);
    const isGroup = item.type === 'GROUP';
    return (
      <ConversationRow
        conversation={item}
        currentUserId={userId}
        participant={participant}
        onOpenProfile={() => {
          if (isGroup) {
            router.push({ pathname: '/group/[id]', params: { id: item.id } });
            return;
          }
          if (!participant?.id) return;
          router.push({ pathname: '/profile/[id]', params: { id: participant.id } });
        }}
        onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
      />
    );
  };

  const emptyContent = (() => {
    if (filters.filter) {
      return (
        <ChatListFilterEmptyState
          filter={filters.filter}
          isError={filters.filteredQuery.isError}
          isPending={filters.isFilterPending}
          onRetry={() => void filters.filteredQuery.refetch()}
        />
      );
    }

    if (query.isPending) {
      return (
        <View style={styles.skeletonList}>
          {Array.from({ length: 6 }, (_, index) => (
            <ConversationSkeleton key={index} />
          ))}
        </View>
      );
    }

    if (query.isError) {
      return (
        <View style={styles.stateCard}>
          <View style={styles.stateIcon}>
            <SymbolView
              name={{ ios: 'wifi.exclamationmark', android: 'wifi_off', web: 'wifi_off' }}
              size={27}
              tintColor={styles.stateIconColor.color}
            />
          </View>
          <ThemedText type="bold" style={styles.stateTitle}>
            {t('list.loadFailed')}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.stateMessage}>
            {query.error instanceof Error ? query.error.message : t('common:errors.tryAgain')}
          </ThemedText>
          <Pressable onPress={() => void query.refetch()} style={styles.retryButton}>
            <ThemedText style={styles.retryText}>{t('common:actions.tryAgain')}</ThemedText>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.stateCard}>
        <View style={styles.stateIcon}>
          <SymbolView
            name={{
              ios: 'bubble.left.and.bubble.right',
              android: 'chat_bubble_outline',
              web: 'chat_bubble_outline',
            }}
            size={29}
            tintColor={styles.stateIconColor.color}
          />
        </View>
        <ThemedText type="bold" style={styles.stateTitle}>
          {t('list.emptyTitle')}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.stateMessage}>
          {t('list.emptyMessage')}
        </ThemedText>
        <Pressable onPress={() => router.push('/(tabs)/discover')} style={styles.retryButton}>
          <ThemedText style={styles.retryText}>{t('list.openDiscover')}</ThemedText>
        </Pressable>
      </View>
    );
  })();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <FlatList
          data={filters.visibleConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <View style={styles.header}>
                <ThemedText accessibilityRole="header" style={styles.title}>
                  {t('list.title')}
                </ThemedText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('list.createGroup')}
                  hitSlop={8}
                  onPress={() => router.push('/group/new')}
                  style={({ pressed }) => [
                    styles.headerButton,
                    pressed && styles.headerButtonPressed,
                  ]}>
                  <SymbolView
                    name={{ ios: 'person.badge.plus', android: 'person_add', web: 'person_add' }}
                    size={19}
                    weight="medium"
                    tintColor={styles.headerButtonIcon.color}
                  />
                </Pressable>
              </View>
              <ChatListFilters
                filter={filters.filter}
                isSearchTriggerHidden={isSearchOpen}
                onOpenSearch={openSearch}
                onSelectFilter={filters.selectFilter}
              />
            </View>
          }
          ListEmptyComponent={emptyContent}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void refresh()}
              tintColor={tokens.loader}
            />
          }
        />
      </SafeAreaView>
    </GradientBackground>
  );
}
