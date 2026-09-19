import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { queryClient } from '@/providers/query-provider';
import type { AuthUser } from '@/screens/auth/types';
import { ApiError } from '@/shared/lib/api-client';
import { socket } from '@/shared/lib/socket';
import { useChatStore } from '@/shared/store/chat-store';

import { editMessage as editMessageRequest, unsendMessage as unsendMessageRequest } from '../api';
import { chatQueryKeys } from '../hooks';
import { useOutboxStore } from '../store/outbox-store';
import type {
  ChatParticipant,
  Conversation,
  GiftedMessage,
  GiftedReplyMessage,
  Message,
} from '../types/message.types';
import { discardMessageFromWindows, replaceMessageInWindows } from '../utils/conversation-cache';
import { isMessage } from '../utils/messages';
import { belongsToChat, outboxMessageToOptimisticMessage } from '../utils/outbox';
import { subscribeToOutboxDelivery } from '../utils/outbox-events';
import { seedNewConversation } from '../utils/seed-new-conversation';
import { useChatImageMessaging } from './use-chat-image-messaging';
import { useGiftedMessages } from './use-gifted-messages';

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
  const [replyingTo, setReplyingTo] = useState<GiftedReplyMessage | null>(null);
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

  const giftedMessages = useGiftedMessages(
    activeMessages,
    conversation?.participants,
    currentUserId,
    participantReadAt,
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
      const replyImages =
        replyMessage?.chatImages ??
        (replyMessage?.image
          ? [
              {
                url: replyMessage.image,
                thumbnailUrl: replyMessage.image,
                width: 1,
                height: 1,
                bytes: 0,
                mimeType: 'image/jpeg',
              },
            ]
          : []);
      const replyTo = replyMessage
        ? {
            id: String(replyMessage._id),
            content: replyMessage.text,
            senderId: String(replyMessage.user._id),
            images: replyImages,
            image: replyImages[0] ?? null,
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

  const handleImageConversationCreated = useCallback(
    ({
      conversationId: deliveredConversationId,
      message,
    }: {
      conversationId: string;
      message: Message;
    }) => {
      seedNewConversation({
        conversationId: deliveredConversationId,
        currentUser,
        draftParticipant,
        message,
      });
      router.setParams({ id: deliveredConversationId });
    },
    [currentUser, draftParticipant],
  );
  const {
    cancelImages,
    chooseImages,
    confirmImages,
    removeSelectedImage,
    retryImages,
    selectedImages,
  } = useChatImageMessaging({
    conversationId,
    currentUserId,
    onConversationCreated: handleImageConversationCreated,
    onError: setSocketError,
    participantId,
    replyingTo,
    setReplyingTo,
  });

  const retryMessage = useCallback(
    (clientMessageId: string) => {
      if (!retryImages(clientMessageId)) {
        useOutboxStore.getState().retry(clientMessageId);
      }
    },
    [retryImages],
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
    cancelImages,
    confirmImages,
    editMessage,
    giftedMessages,
    handleChooseImages: chooseImages,
    handleInputChange,
    handleSend,
    removeSelectedImage,
    retryMessage,
    replyingTo,
    setReplyingTo,
    selectedImages,
    unsendMessage,
  };
}
