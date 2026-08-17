import { useMutation, useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/store/auth-store';

import { findDirectConversation, getConversation, getConversations } from './api';

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

  return useQuery({
    queryKey: chatQueryKeys.conversation(id ?? ''),
    queryFn: () => getConversation(id as string),
    enabled: Boolean(token && id),
    refetchOnMount: 'always',
  });
}

export function useFindDirectConversation() {
  return useMutation({ mutationFn: findDirectConversation });
}
