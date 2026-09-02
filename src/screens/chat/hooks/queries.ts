import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/store/auth-store';

import {
  findDirectConversation,
  getConversation,
  getConversations,
  getConversationsUnreadCount,
} from '../api';
import type { ConversationWindowParams } from '../api';

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
  ) => ['chats', 'conversation', accountId, id, anchorMessageId ?? 'latest'] as const,
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
 * window and returning to it is instant. Pages run newest-first: the next page is older, the
 * previous page is newer.
 */
export function useConversation(id?: string, anchorMessageId?: string | null) {
  const accountId = useAuthStore((state) => state.activeAccountId);
  const token = useAuthStore((state) => state.token);

  return useInfiniteQuery({
    queryKey: chatQueryKeys.conversationWindow(id ?? '', anchorMessageId ?? null, accountId ?? ''),
    queryFn: ({ pageParam }) => getConversation(id as string, pageParam),
    initialPageParam: (anchorMessageId
      ? { around: anchorMessageId }
      : {}) as ConversationWindowParams,
    getNextPageParam: (lastPage): ConversationWindowParams | undefined =>
      lastPage.pageInfo?.olderCursor ? { before: lastPage.pageInfo.olderCursor } : undefined,
    getPreviousPageParam: (firstPage): ConversationWindowParams | undefined =>
      firstPage.pageInfo?.newerCursor ? { after: firstPage.pageInfo.newerCursor } : undefined,
    enabled: Boolean(accountId && token && id),
    refetchOnWindowFocus: 'always',
  });
}

export function useFindDirectConversation() {
  return useMutation({ mutationFn: findDirectConversation });
}
