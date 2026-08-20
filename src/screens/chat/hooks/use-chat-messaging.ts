import type { InfiniteData } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import type { ReplyMessage } from 'react-native-gifted-chat';

import { queryClient } from '@/providers/query-provider';
import { ApiError } from '@/shared/lib/api-client';
import type { AuthUser } from '@/screens/auth/types';
import { prepareSocketAuth, socket } from '@/shared/lib/socket';
import { useChatStore } from '@/shared/store/chatStore';

import type { ConversationWindowParams } from '../api';
import { chatQueryKeys } from '../hooks';
import type {
  ChatParticipant,
  Conversation,
  ConversationResponse,
  GiftedMessage,
  Message,
} from '../types';
import { editMessage as editMessageRequest, unsendMessage as unsendMessageRequest } from '../api';
import { discardMessageFromWindows, replaceMessageInWindows } from '../utils/conversation-cache';
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
  const replaceMessage = useChatStore((state) => state.replaceMessage);
  const discardMessage = useChatStore((state) => state.discardMessage);
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

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      const nextContent = content.trim();
      const existing = useChatStore
        .getState()
        .activeMessages.find((message) => message.id === messageId);
      if (!conversationId || !nextContent || !existing) return;
      if (nextContent === existing.content) return;

      const optimistic = { ...existing, content: nextContent, editedAt: new Date().toISOString() };
      replaceMessage(optimistic);
      replaceMessageInWindows(conversationId, optimistic);

      try {
        const response = await editMessageRequest(conversationId, messageId, nextContent);
        if (response?.message && isMessage(response.message)) {
          replaceMessage(response.message);
          replaceMessageInWindows(conversationId, response.message);
        }
        void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      } catch (error) {
        replaceMessage(existing);
        // The cached pages are put right by refetching rather than by unpicking the patch.
        void queryClient.invalidateQueries({
          queryKey: chatQueryKeys.conversation(conversationId),
        });
        setSocketError(error instanceof ApiError ? error.message : 'Message could not be edited.');
      }
    },
    [conversationId, replaceMessage, setSocketError],
  );

  const unsendMessage = useCallback(
    async (messageId: string) => {
      const { activeMessages } = useChatStore.getState();
      const existing = activeMessages.find((message) => message.id === messageId);
      if (!conversationId || !existing) return;

      // Kept for rollback: restoring means putting the message back and re-linking its quotes.
      const quotingMessages = activeMessages.filter((message) => message.replyTo?.id === messageId);
      discardMessage(messageId);
      discardMessageFromWindows(conversationId, messageId);

      try {
        await unsendMessageRequest(conversationId, messageId);
        void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      } catch (error) {
        addMessage(existing);
        quotingMessages.forEach(replaceMessage);
        // The cached pages are put right by refetching rather than by unpicking the patch.
        void queryClient.invalidateQueries({
          queryKey: chatQueryKeys.conversation(conversationId),
        });
        setSocketError(error instanceof ApiError ? error.message : 'Message could not be unsent.');
      }
    },
    [addMessage, conversationId, discardMessage, replaceMessage, setSocketError],
  );

  return {
    editMessage,
    giftedMessages,
    handleInputChange,
    handleSend,
    replyingTo,
    setReplyingTo,
    unsendMessage,
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
              },
              draftParticipant,
            ],
            messages: [message],
          },
          pageInfo: { hasMore: false, olderCursor: null },
        },
      ],
      pageParams: [{}],
    },
  );
}
