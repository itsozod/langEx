import type { InfiniteData } from '@tanstack/react-query';

import { queryClient } from '@/providers/query-provider';
import type { AuthUser } from '@/screens/auth/types';

import type { ConversationWindowParams } from '../api';
import { chatQueryKeys } from '../hooks';
import type { ChatParticipant, ConversationResponse, Message } from '../types/message.types';
import { isMessage } from './messages';

export function seedNewConversation({
  conversationId,
  currentUser,
  draftParticipant,
  message,
}: {
  conversationId: string;
  currentUser: AuthUser | null;
  draftParticipant?: ChatParticipant;
  message?: Message;
}) {
  if (!message || !isMessage(message) || !draftParticipant || !currentUser) return;

  queryClient.setQueryData<InfiniteData<ConversationResponse, ConversationWindowParams>>(
    chatQueryKeys.conversationWindow(conversationId, null),
    {
      pages: [
        {
          conversation: {
            id: conversationId,
            participants: [
              {
                id: currentUser.id,
                displayName: currentUser.displayName ?? null,
                avatarUrl: currentUser.avatarUrl ?? null,
                country: currentUser.country ?? null,
                isDeleted: false,
              },
              draftParticipant,
            ],
            isReadOnly: false,
            messages: [message],
          },
          pageInfo: { hasMore: false, olderCursor: null },
        },
      ],
      pageParams: [{}],
    },
  );
}
