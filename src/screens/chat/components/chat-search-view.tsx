import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { ListRenderItem } from 'react-native';

import { leaveSearch, SearchOverlay } from '@/shared/components/search-overlay/search-overlay';
import { SearchLoadingState, SearchState } from '@/shared/components/search-overlay/search-state';
import type { SearchBarRect } from '@/shared/hooks/use-search-overlay-transition';

import { useChatSearch } from '../hooks/use-chat-search';
import type { Conversation } from '../types/message.types';
import { ChatSearchResultRow } from './chat-search-result-row';
import { getOtherParticipant } from './conversation-row';

type ChatSearchViewProps = {
  currentUserId?: string;
  origin: SearchBarRect | null;
  onClosed: () => void;
};

/** Full-screen chat search; opening a result pushes a chat or profile on top of it. */
export function ChatSearchView({ currentUserId, origin, onClosed }: ChatSearchViewProps) {
  const { t } = useTranslation(['chat', 'common']);
  const search = useChatSearch();

  const renderResult: ListRenderItem<Conversation> = ({ item }) => {
    const isGroup = item.type === 'GROUP';
    const participant = isGroup ? undefined : getOtherParticipant(item, currentUserId);
    return (
      <ChatSearchResultRow
        conversation={item}
        participant={participant}
        search={search.search}
        onOpenChat={() =>
          leaveSearch(() => router.push({ pathname: '/chat/[id]', params: { id: item.id } }))
        }
        onOpenProfile={() =>
          leaveSearch(() => {
            if (isGroup) router.push({ pathname: '/group/[id]', params: { id: item.id } });
            else if (participant?.id)
              router.push({ pathname: '/profile/[id]', params: { id: participant.id } });
          })
        }
      />
    );
  };

  const emptyState = !search.searchText.trim() ? (
    <SearchState
      icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
      message={t('search.idleMessage')}
      title={t('search.idleTitle')}
    />
  ) : search.isLoadingResults ? (
    <SearchLoadingState />
  ) : search.query.isError ? (
    <SearchState
      actionLabel={t('common:actions.tryAgain')}
      icon={{ ios: 'wifi.exclamationmark', android: 'wifi_off', web: 'wifi_off' }}
      message={t('common:errors.tryAgain')}
      onAction={() => void search.query.refetch()}
      title={t('list.loadFailed')}
    />
  ) : (
    <SearchState
      icon={{ ios: 'person.2.slash', android: 'person_off', web: 'person_off' }}
      message={t('filters.noSearchResultsMessage')}
      title={t('filters.noSearchResults', { query: search.search })}
    />
  );

  return (
    <SearchOverlay
      origin={origin}
      onClosed={onClosed}
      accessibilityLabel={t('filters.searchLabel')}
      clearLabel={t('filters.clearSearch')}
      isPending={search.isBusy}
      onChangeText={search.setSearchText}
      placeholder={t('filters.searchPlaceholder')}
      value={search.searchText}
      cancelLabel={t('common:actions.cancel')}
      closeLabel={t('search.close')}
      data={search.results}
      keyExtractor={(item) => item.id}
      renderItem={renderResult}
      ListEmptyComponent={emptyState}
      sectionLabel={t('search.resultsLabel', { count: search.results.length })}
    />
  );
}
