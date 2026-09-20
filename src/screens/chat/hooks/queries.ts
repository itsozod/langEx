import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/store/auth-store';

import {
  findDirectConversation,
  getConversation,
  getConversations,
  getConversationsUnreadCount,
} from '../api';
import type { ConversationWindowParams } from '../api';

/** Keep chat memory bounded while still retaining several screens around the reader. */
const MAX_CONVERSATION_WINDOW_PAGES = 5;

export const chatQueryKeys = {
  all: ['chats'] as const,
  conversations: (accountId = useAuthStore.getState().activeAccountId ?? '') =>
    ['chats', 'conversations', accountId] as const,
  unreadCounts: () => ['chats', 'unread-count'] as const,
  unreadCount: (accountId: string) => ['chats', 'unread-count', accountId] as const,
  presence: (accountId: string, userId: string) =>
    ['chats', 'presence', accountId, userId] as const,
  conversation: (id: string, accountId = useAuthStore.getState().activeAccountId ?? '') =>
    ['chats', 'conversation', accountId, id] as const,
  conversationWindow: (
    id: string,
    anchorMessageId: string | null,
    accountId = useAuthStore.getState().activeAccountId ?? '',
    windowVersion = 0,
  ) =>
    anchorMessageId
      ? (['chats', 'conversation', accountId, id, anchorMessageId, windowVersion] as const)
      : (['chats', 'conversation', accountId, id, 'latest'] as const),
};

export function useConversationsUnreadCount() {
  const accountId = useAuthStore((state) => state.activeAccountId);
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: chatQueryKeys.unreadCount(accountId ?? ''),
    queryFn: getConversationsUnreadCount,
    enabled: Boolean(accountId && token),
    refetchOnWindowFocus: 'always',
  });
}

export function useConversations() {
  const accountId = useAuthStore((state) => state.activeAccountId);
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: chatQueryKeys.conversations(accountId ?? ''),
    queryFn: getConversations,
    enabled: Boolean(accountId && token),
    refetchOnWindowFocus: 'always',
  });
}

/**
 * Each anchor gets its own cached window, so jumping to an old message never disturbs the newest
 * window and returning to it is instant. Historical windows page in both directions while the
 * bounded cache evicts the page furthest from the direction of travel.
 */
export function useConversation(id?: string, anchorMessageId?: string | null, windowVersion = 0) {
  const accountId = useAuthStore((state) => state.activeAccountId);
  const token = useAuthStore((state) => state.token);

  return useInfiniteQuery({
    queryKey: chatQueryKeys.conversationWindow(
      id ?? '',
      anchorMessageId ?? null,
      accountId ?? '',
      windowVersion,
    ),
    queryFn: ({ pageParam }) => getConversation(id as string, pageParam),
    initialPageParam: (anchorMessageId
      ? { around: anchorMessageId }
      : {}) as ConversationWindowParams,
    getNextPageParam: (lastPage): ConversationWindowParams | undefined =>
      lastPage.pageInfo?.olderCursor ? { before: lastPage.pageInfo.olderCursor } : undefined,
    getPreviousPageParam: (firstPage): ConversationWindowParams | undefined =>
      firstPage.pageInfo?.newerCursor ? { after: firstPage.pageInfo.newerCursor } : undefined,
    maxPages: MAX_CONVERSATION_WINDOW_PAGES,
    enabled: Boolean(accountId && token && id),
    refetchOnWindowFocus: 'always',
  });
}

export function useFindDirectConversation() {
  return useMutation({ mutationFn: findDirectConversation });
}
