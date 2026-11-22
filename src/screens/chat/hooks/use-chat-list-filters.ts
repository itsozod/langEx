import { useCallback, useMemo, useState } from 'react';

import { useChatStore } from '@/shared/store/chat-store';

import type { ConversationListFilter } from '../api';
import type { Conversation } from '../types/message.types';
import { useFilteredConversations } from './queries';

/**
 * Owns the single active filter chip on the chat list. The server decides which conversations
 * match and their order, but each row renders the live store copy so socket updates (new
 * messages, presence, unread counts) still appear immediately.
 */
export function useChatListFilters() {
  const conversations = useChatStore((state) => state.conversations);
  const [filter, setFilter] = useState<ConversationListFilter | null>(null);
  const filteredQuery = useFilteredConversations('', filter);
  const isFiltering = filter !== null;

  const selectFilter = useCallback((next: ConversationListFilter | null) => setFilter(next), []);

  const visibleConversations = useMemo<Conversation[]>(
    () =>
      isFiltering
        ? withLiveConversations(filteredQuery.data?.conversations, conversations)
        : conversations,
    [conversations, filteredQuery.data, isFiltering],
  );

  return {
    filter,
    filteredQuery,
    isFiltering,
    isFilterPending: isFiltering && filteredQuery.isPending,
    selectFilter,
    visibleConversations,
  };
}

/** Keeps the server's matches and order while preferring the live store copy of each row. */
export function withLiveConversations(
  matches: Conversation[] | undefined,
  liveConversations: Conversation[],
) {
  if (!matches) return [];
  const liveById = new Map(
    liveConversations.map((conversation) => [conversation.id, conversation]),
  );
  return matches.map((match) => liveById.get(match.id) ?? match);
}
