import type { InfiniteData } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReplyMessage } from 'react-native-gifted-chat';

import { queryClient } from '@/providers/query-provider';
import type { AuthUser } from '@/screens/auth/types';
import { ApiError } from '@/shared/lib/api-client';
import { socket } from '@/shared/lib/socket';
import { useChatStore } from '@/shared/store/chat-store';

import type { ConversationWindowParams } from '../api';
import { editMessage as editMessageRequest, unsendMessage as unsendMessageRequest } from '../api';
import { chatQueryKeys } from '../hooks';
import { useOutboxStore } from '../store/outbox-store';
import type {
  ChatParticipant,
  Conversation,
  ConversationResponse,
  GiftedMessage,
  Message,
} from '../types/message.types';
import { discardMessageFromWindows, replaceMessageInWindows } from '../utils/conversation-cache';
import { isMessage, toGiftedMessages } from '../utils/messages';
import { belongsToChat, outboxMessageToOptimisticMessage } from '../utils/outbox';
import { subscribeToOutboxDelivery } from '../utils/outbox-events';

type UseChatMessagingOptions = {
  conversation?: Conversation;
  conversationId?: string;
  currentUser: AuthUser | null;
  draftParticipant?: ChatParticipant;
  participantId?: string;
  participantReadAt?: string;
  setSocketError: (error: string | null) => void;
};

export function useChatMessaging({
  conversation,
  conversationId,
  currentUser,
  draftParticipant,
  participantId,
  participantReadAt,
  setSocketError,
}: UseChatMessagingOptions) {
  const activeMessages = useChatStore((state) => state.activeMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateConversationFromMessage = useChatStore(
    (state) => state.updateConversationFromMessage,
  );
  const mergeMessages = useChatStore((state) => state.mergeMessages);
  const replaceMessage = useChatStore((state) => state.replaceMessage);
  const discardMessage = useChatStore((state) => state.discardMessage);
  const [replyingTo, setReplyingTo] = useState<ReplyMessage | null>(null);
  const currentUserId = currentUser?.id;
  const outboxMessages = useOutboxStore((state) => state.messages);
  const deliverySubscriptions = useRef(new Set<() => void>());
  const messagesForThisChat = useMemo(
    () =>
      outboxMessages
        .filter(
          (message) =>
            message.userId === currentUserId &&
            belongsToChat(message, conversationId, participantId),
        )
        .map(outboxMessageToOptimisticMessage),
    [conversationId, currentUserId, outboxMessages, participantId],
  );

  useEffect(() => {
    mergeMessages(messagesForThisChat);
  }, [mergeMessages, messagesForThisChat]);

  useEffect(
    () => () => {
      deliverySubscriptions.current.forEach((unsubscribe) => unsubscribe());
      deliverySubscriptions.current.clear();
    },
    [],
  );

  const giftedMessages = useMemo(
    () =>
      toGiftedMessages(
        activeMessages,
        conversation?.participants,
        currentUserId,
        participantReadAt,
      ),
    [activeMessages, conversation?.participants, currentUserId, participantReadAt],
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
      const outboxMessage = useOutboxStore.getState().enqueue({
        userId: currentUserId,
        content,
        conversationId,
        participantId,
        createdAt: new Date().toISOString(),
        replyToId: replyTo?.id,
        replyTo,
      });

      const optimisticMessage = outboxMessageToOptimisticMessage(outboxMessage);
      addMessage(optimisticMessage);
      updateConversationFromMessage(optimisticMessage);

      if (!conversationId) {
        const unsubscribe = subscribeToOutboxDelivery(
          outboxMessage.clientMessageId,
          ({ conversationId: deliveredConversationId, message }) => {
            seedNewConversation({
              conversationId: deliveredConversationId,
              currentUser,
              draftParticipant,
              message,
            });
            router.setParams({ id: deliveredConversationId });
            unsubscribe();
            deliverySubscriptions.current.delete(unsubscribe);
          },
        );
        deliverySubscriptions.current.add(unsubscribe);
      }
    },
    [
      addMessage,
      conversationId,
      currentUser,
      currentUserId,
      draftParticipant,
      participantId,
      updateConversationFromMessage,
    ],
  );

  const retryMessage = useCallback((clientMessageId: string) => {
    useOutboxStore.getState().retry(clientMessageId);
  }, []);

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
    retryMessage,
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
