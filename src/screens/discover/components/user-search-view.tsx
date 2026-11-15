import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchOverlay } from '@/shared/components/search-overlay/search-overlay';
import { SearchLoadingState, SearchState } from '@/shared/components/search-overlay/search-state';
import type { SearchBarRect } from '@/shared/hooks/use-search-overlay-transition';

import { useUserSearch } from '../hooks';
import { UserSearchResultRow } from './user-search-result-row';

const MIN_QUERY_LENGTH = 2;

type UserSearchViewProps = {
  origin: SearchBarRect | null;
  onClosed: () => void;
};

/** Full-screen search for people in the LangEx community; a result opens their profile. */
export function UserSearchView({ origin, onClosed }: UserSearchViewProps) {
  const { t } = useTranslation(['discover', 'common']);
  const [searchText, setSearchText] = useState('');
  const { debouncedQuery, query } = useUserSearch(searchText);
  const trimmed = searchText.trim();
  const hasQuery = trimmed.length >= MIN_QUERY_LENGTH;
  const isLoading =
    hasQuery && (trimmed !== debouncedQuery || query.isPending || query.isPlaceholderData);
  const users = hasQuery ? (query.data?.users ?? []) : [];

  const emptyState = !hasQuery ? (
    <SearchState
      icon={{ ios: 'person.2.fill', android: 'person', web: 'person' }}
      message={t('search.idleMessage')}
      title={t('search.idleTitle')}
    />
  ) : isLoading ? (
    <SearchLoadingState />
  ) : query.isError ? (
    <SearchState
      actionLabel={t('common:actions.tryAgain')}
      icon={{ ios: 'wifi.exclamationmark', android: 'wifi_off', web: 'wifi_off' }}
      message={
        query.error instanceof Error ? query.error.message : t('common:errors.checkConnection')
      }
      onAction={() => void query.refetch()}
      title={t('search.unavailable')}
    />
  ) : (
    <SearchState
      icon={{
        ios: 'person.crop.circle.badge.questionmark',
        android: 'person_off',
        web: 'person_off',
      }}
      message={t('search.noMatchMessage')}
      title={t('search.noMatch', { query: debouncedQuery })}
    />
  );

  return (
    <SearchOverlay
      origin={origin}
      onClosed={onClosed}
      accessibilityLabel={t('search.label')}
      autoCapitalize="words"
      clearLabel={t('search.clear')}
      isPending={isLoading || (hasQuery && query.isFetching)}
      onChangeText={setSearchText}
      placeholder={t('search.placeholder')}
      value={searchText}
      cancelLabel={t('common:actions.cancel')}
      closeLabel={t('search.close')}
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <UserSearchResultRow user={item} />}
      ListEmptyComponent={emptyState}
      sectionLabel={t('search.resultsLabel', { count: users.length })}
    />
  );
}
