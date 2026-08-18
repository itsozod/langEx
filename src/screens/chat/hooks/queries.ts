import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/store/auth-store';

import { findDirectConversation, getConversation, getConversations } from '../api';

export const chatQueryKeys = {
  all: ['chats'] as const,
  conversations: () => ['chats', 'conversations'] as const,
  conversation: (id: string) => ['chats', 'conversation', id] as const,
};

export function useConversations() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: chatQueryKeys.conversations(),
    queryFn: getConversations,
    enabled: Boolean(token),
  });
}

export function useConversation(id?: string) {
  const token = useAuthStore((state) => state.token);

  return useInfiniteQuery({
    queryKey: chatQueryKeys.conversation(id ?? ''),
    queryFn: ({ pageParam }) => getConversation(id as string, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.pageInfo?.olderCursor ?? undefined,
    enabled: Boolean(token && id),
  });
}

export function useFindDirectConversation() {
  return useMutation({ mutationFn: findDirectConversation });
}
