import { useMemo, useState } from 'react';

import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { useChatStore } from '@/shared/store/chat-store';

import { useFilteredConversations } from './queries';
import { withLiveConversations } from './use-chat-list-filters';

const SEARCH_DEBOUNCE_MS = 300;

/** Search text and server results for the full-screen chat search. */
export function useChatSearch() {
  const conversations = useChatStore((state) => state.conversations);
  const [searchText, setSearchText] = useState('');
  const trimmed = searchText.trim();
  const search = useDebouncedValue(trimmed, SEARCH_DEBOUNCE_MS);
  const query = useFilteredConversations(search, null);
  // Results stay visible while the next search loads (keepPreviousData) to avoid flashing.
  const hasSearch = trimmed.length > 0 && search.length > 0;

  const results = useMemo(
    () => (hasSearch ? withLiveConversations(query.data?.conversations, conversations) : []),
    [conversations, hasSearch, query.data],
  );
  const isLoadingResults =
    trimmed.length > 0 && (trimmed !== search || query.isPending || query.isPlaceholderData);

  return {
    hasSearch,
    isLoadingResults,
    // Drives the small spinner inside the search bar, including background refreshes.
    isBusy: isLoadingResults || (hasSearch && query.isFetching),
    query,
    results,
    search,
    searchText,
    setSearchText,
  };
}
