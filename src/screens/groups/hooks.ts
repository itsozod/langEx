import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/providers/query-provider';
import { chatQueryKeys } from '@/screens/chat/hooks';
import type { ConversationsResponse } from '@/screens/chat/types/message.types';
import {
  mergeConversationIntoCaches,
  removeConversationFromListCache,
  removeParticipantFromGroupCaches,
  upsertMessageInLatestWindow,
} from '@/screens/chat/utils/conversation-cache';
import { formatMessageSystemEvent } from '@/screens/chat/utils/system-events';
import { useAuthStore } from '@/shared/store/auth-store';
import { useChatStore } from '@/shared/store/chat-store';

import { addGroupParticipants, createGroup, getGroupCandidates, manageGroup } from './api';

export const groupQueryKeys = {
  candidates: (accountId: string) => ['groups', 'candidates', accountId] as const,
};

export function useGroupCandidates() {
  const accountId = useAuthStore((state) => state.activeAccountId);
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: groupQueryKeys.candidates(accountId ?? ''),
    queryFn: getGroupCandidates,
    enabled: Boolean(accountId && token),
    refetchOnWindowFocus: 'always',
  });
}

export function useCreateGroup() {
  return useMutation({
    mutationFn: createGroup,
    onSuccess: ({ conversation, systemMessages }) => {
      const lastMessage = systemMessages[systemMessages.length - 1];
      const listConversation = lastMessage
        ? {
            ...conversation,
            lastMessage,
            lastMessageKind: lastMessage.kind ?? 'CHAT',
            lastMessagePreview: formatMessageSystemEvent(
              lastMessage.systemEvent,
              useAuthStore.getState().activeAccountId ?? undefined,
            ),
            lastMessageSystemEvent: lastMessage.systemEvent ?? null,
            lastMessageTimestamp: lastMessage.createdAt,
          }
        : conversation;
      queryClient.setQueryData<ConversationsResponse>(chatQueryKeys.conversations(), (current) => ({
        conversations: [
          listConversation,
          ...(current?.conversations.filter((item) => item.id !== conversation.id) ?? []),
        ],
      }));
      void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
    },
  });
}

export function useAddGroupParticipants() {
  return useMutation({
    mutationFn: addGroupParticipants,
    onSuccess: ({ conversation, systemMessages }) => {
      mergeConversationIntoCaches(conversation);
      for (const message of systemMessages) {
        const confirmed = { ...message, conversationId: conversation.id };
        upsertMessageInLatestWindow(conversation.id, confirmed);
        useChatStore.getState().updateConversationFromMessage(confirmed);
      }
      void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      void queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversation(conversation.id),
      });
      const accountId = useAuthStore.getState().activeAccountId;
      if (accountId) {
        void queryClient.invalidateQueries({ queryKey: groupQueryKeys.candidates(accountId) });
      }
    },
  });
}

export function useManageGroup() {
  return useMutation({
    mutationFn: manageGroup,
    onSuccess: (response, input) => {
      if ('conversation' in response) {
        mergeConversationIntoCaches(response.conversation);
      } else if (input.type === 'remove-member') {
        removeParticipantFromGroupCaches(input.conversationId, input.participantId);
      } else if (input.type === 'leave-group') {
        removeConversationFromListCache(input.conversationId);
        useChatStore.getState().removeConversation(input.conversationId);
        queryClient.removeQueries({ queryKey: chatQueryKeys.conversation(input.conversationId) });
      }

      if (input.type !== 'leave-group') {
        void queryClient.invalidateQueries({
          queryKey: chatQueryKeys.conversation(input.conversationId),
        });
      }
      void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
    },
  });
}
