import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/store/auth-store';

import { findDirectConversation, getConversation, getConversations } from '../api';
import type { ConversationWindowParams } from '../api';

export const chatQueryKeys = {
  all: ['chats'] as const,
  conversations: () => ['chats', 'conversations'] as const,
  conversation: (id: string) => ['chats', 'conversation', id] as const,
  conversationWindow: (id: string, anchorMessageId: string | null) =>
    ['chats', 'conversation', id, anchorMessageId ?? 'latest'] as const,
};

export function useConversations() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: chatQueryKeys.conversations(),
    queryFn: getConversations,
    enabled: Boolean(token),
  });
}

/**
 * Each anchor gets its own cached window, so jumping to an old message never disturbs the newest
 * window and returning to it is instant. Pages run newest-first: the next page is older, the
 * previous page is newer.
 */
export function useConversation(id?: string, anchorMessageId?: string | null) {
  const token = useAuthStore((state) => state.token);

  return useInfiniteQuery({
    queryKey: chatQueryKeys.conversationWindow(id ?? '', anchorMessageId ?? null),
    queryFn: ({ pageParam }) => getConversation(id as string, pageParam),
    initialPageParam: (anchorMessageId
      ? { around: anchorMessageId }
      : {}) as ConversationWindowParams,
    getNextPageParam: (lastPage): ConversationWindowParams | undefined =>
      lastPage.pageInfo?.olderCursor ? { before: lastPage.pageInfo.olderCursor } : undefined,
    getPreviousPageParam: (firstPage): ConversationWindowParams | undefined =>
      firstPage.pageInfo?.newerCursor ? { after: firstPage.pageInfo.newerCursor } : undefined,
    enabled: Boolean(token && id),
  });
}

export function useFindDirectConversation() {
  return useMutation({ mutationFn: findDirectConversation });
}
