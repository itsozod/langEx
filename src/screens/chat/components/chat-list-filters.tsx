import { ActivityIndicator, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import type { ConversationListFilter } from '../api';
import { SearchTrigger } from '@/shared/components/search-overlay/search-trigger';
import type { SearchBarRect } from '@/shared/hooks/use-search-overlay-transition';
import { useChatListFilterStyles } from '../styles/chat-list-filter-styles';
import { useChatsStyles } from '../styles/chats-styles';
import { ChatListFilterChips } from './chat-list-filter-chips';
import { useUiTokens } from '@/shared/hooks/use-ui-tokens';

type ChatListFiltersProps = {
  filter: ConversationListFilter | null;
  isSearchTriggerHidden: boolean;
  onOpenSearch: (origin: SearchBarRect | null) => void;
  onSelectFilter: (filter: ConversationListFilter | null) => void;
};

export function ChatListFilters({
  filter,
  isSearchTriggerHidden,
  onOpenSearch,
  onSelectFilter,
}: ChatListFiltersProps) {
  const styles = useChatListFilterStyles();
  const { t } = useTranslation('chat');

  return (
    <View style={styles.container}>
      <SearchTrigger
        accessibilityHint={t('search.openHint')}
        accessibilityLabel={t('filters.searchLabel')}
        hidden={isSearchTriggerHidden}
        onOpen={onOpenSearch}
        placeholder={t('filters.searchPlaceholder')}
      />
      <ChatListFilterChips selected={filter} onSelect={onSelectFilter} />
    </View>
  );
}

type ChatListFilterEmptyStateProps = {
  filter: ConversationListFilter;
  isError: boolean;
  isPending: boolean;
  onRetry: () => void;
};

export function ChatListFilterEmptyState({
  filter,
  isError,
  isPending,
  onRetry,
}: ChatListFilterEmptyStateProps) {
  const styles = useChatsStyles();
  const tokens = useUiTokens();
  const { t } = useTranslation(['chat', 'common']);

  if (isPending) {
    return (
      <View style={styles.stateCard}>
        <ActivityIndicator color={tokens.loader} />
      </View>
    );
  }

  const title = isError
    ? t('list.loadFailed')
    : filter === 'online'
      ? t('filters.noOnline')
      : t('filters.noUnread');
  const message = isError
    ? t('common:errors.tryAgain')
    : filter === 'online'
      ? t('filters.noOnlineMessage')
      : t('filters.noUnreadMessage');

  return (
    <View style={styles.stateCard}>
      <View style={styles.stateIcon}>
        <SymbolView
          name={
            isError
              ? { ios: 'wifi.exclamationmark', android: 'wifi_off', web: 'wifi_off' }
              : filter === 'online'
                ? { ios: 'person.2.slash', android: 'person_off', web: 'person_off' }
                : { ios: 'checkmark', android: 'check', web: 'check' }
          }
          size={27}
          tintColor={styles.stateIconColor.color}
        />
      </View>
      <ThemedText type="bold" style={styles.stateTitle}>
        {title}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.stateMessage}>
        {message}
      </ThemedText>
      {isError ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <ThemedText style={styles.retryText}>{t('common:actions.tryAgain')}</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}
