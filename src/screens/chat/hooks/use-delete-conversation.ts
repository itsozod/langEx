import { useMutation } from '@tanstack/react-query';

import { queryClient } from '@/providers/query-provider';
import { useAuthStore } from '@/shared/store/auth-store';
import { useChatStore } from '@/shared/store/chat-store';
import { useUserStore } from '@/shared/store/user.store';

import { deleteConversation } from '../api';
import { useOutboxStore } from '../store/outbox-store';
import type { ConversationsResponse } from '../types/message.types';
import { chatQueryKeys } from './queries';

type DeleteConversationVariables = {
  accountId: string;
  conversationId: string;
  userId: string;
};

export function useDeleteConversation() {
  return useMutation({
    mutationFn: ({ conversationId }: DeleteConversationVariables) =>
      deleteConversation(conversationId),
    onSuccess: (_response, variables) => {
      queryClient.setQueryData<ConversationsResponse>(
        chatQueryKeys.conversations(variables.accountId),
        (current) =>
          current
            ? {
                ...current,
                conversations: current.conversations.filter(
                  (conversation) => conversation.id !== variables.conversationId,
                ),
              }
            : current,
      );
      queryClient.removeQueries({
        queryKey: chatQueryKeys.conversation(variables.conversationId, variables.accountId),
      });
      useChatStore.getState().removeConversation(variables.conversationId);
      useOutboxStore.getState().clearConversation(variables.userId, variables.conversationId);
      void queryClient.invalidateQueries({
        queryKey: chatQueryKeys.unreadCount(variables.accountId),
      });
    },
  });
}

export function getActiveDeleteConversationVariables(
  conversationId: string,
): DeleteConversationVariables | null {
  const accountId = useAuthStore.getState().activeAccountId;
  const userId = useUserStore.getState().user?.id;
  return accountId && userId ? { accountId, conversationId, userId } : null;
}
