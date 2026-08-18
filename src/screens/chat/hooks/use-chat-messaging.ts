import type { InfiniteData } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import type { ReplyMessage } from 'react-native-gifted-chat';

import { queryClient } from '@/providers/query-provider';
import type { AuthUser } from '@/screens/auth/types';
import { prepareSocketAuth, socket } from '@/shared/lib/socket';
import { useChatStore } from '@/shared/store/chatStore';

import { chatQueryKeys } from '../hooks';
import type {
  ChatParticipant,
  Conversation,
  ConversationResponse,
  GiftedMessage,
  Message,
} from '../types';
import { isMessage, toGiftedMessages } from '../utils/messages';

type UseChatMessagingOptions = {
  conversation?: Conversation;
  conversationId?: string;
  currentUser: AuthUser | null;
  draftParticipant?: ChatParticipant;
  participantId?: string;
  setSocketError: (error: string | null) => void;
};

export function useChatMessaging({
  conversation,
  conversationId,
  currentUser,
  draftParticipant,
  participantId,
  setSocketError,
}: UseChatMessagingOptions) {
  const activeMessages = useChatStore((state) => state.activeMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const removeMessage = useChatStore((state) => state.removeMessage);
  const [replyingTo, setReplyingTo] = useState<ReplyMessage | null>(null);
  const currentUserId = currentUser?.id;

  const giftedMessages = useMemo(
    () => toGiftedMessages(activeMessages, conversation?.participants, currentUserId),
    [activeMessages, conversation?.participants, currentUserId],
  );

  const handleInputChange = useCallback(
    (text: string) => {
      if (!conversationId || !socket.connected) return;
      socket.emit(text.trim() ? 'typing' : 'stop_typing', conversationId);
    },
    [conversationId],
  );

  const handleSend = useCallback(
    (messages: GiftedMessage[]) => {
      const content = messages[0]?.text.trim();
      if (!content || !currentUserId || (!conversationId && !participantId)) return;

      const replyMessage = messages[0]?.replyMessage;
      const replyTo = replyMessage
        ? {
            id: String(replyMessage._id),
            content: replyMessage.text,
            senderId: String(replyMessage.user._id),
          }
        : undefined;

      if (conversationId) socket.emit('stop_typing', conversationId);
      const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimisticMessage: Message = {
        id: optimisticId,
        content,
        senderId: currentUserId,
        conversationId,
        createdAt: new Date().toISOString(),
        replyTo,
        isOptimistic: true,
      };

      addMessage(optimisticMessage);

      prepareSocketAuth();
      if (!socket.connected) socket.connect();
      socket.emit(
        'send_message',
        conversationId
          ? { conversationId, content, replyToId: replyTo?.id }
          : { participantId, content },
        (response) => {
          if (!response.ok) {
            removeMessage(optimisticId);
            if (replyMessage) setReplyingTo(replyMessage);
            setSocketError(response.error ?? 'Message could not be sent.');
            return;
          }

          if (response.message && isMessage(response.message)) addMessage(response.message);
          void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });

          if (!conversationId && response.conversationId) {
            seedNewConversation({
              conversationId: response.conversationId,
              currentUser,
              draftParticipant,
              message: response.message,
            });
            router.setParams({ id: response.conversationId });
          }
        },
      );
    },
    [
      addMessage,
      conversationId,
      currentUser,
      currentUserId,
      draftParticipant,
      participantId,
      removeMessage,
      setSocketError,
    ],
  );

  return {
    giftedMessages,
    handleInputChange,
    handleSend,
    replyingTo,
    setReplyingTo,
  };
}

function seedNewConversation({
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

  queryClient.setQueryData<InfiniteData<ConversationResponse, string | null>>(
    chatQueryKeys.conversation(conversationId),
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
              },
              draftParticipant,
            ],
            messages: [message],
          },
          pageInfo: { hasMore: false, olderCursor: null },
        },
      ],
      pageParams: [null],
    },
  );
}
