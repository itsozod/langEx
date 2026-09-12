import * as ImagePicker from 'expo-image-picker';
import { useCallback, useRef, useState } from 'react';

import { queryClient } from '@/providers/query-provider';
import { useAuthStore } from '@/shared/store/auth-store';
import { useChatStore } from '@/shared/store/chat-store';

import { sendChatImages } from '../api';
import { chatQueryKeys } from '../hooks';
import type {
  ChatImageSelection,
  GiftedReplyMessage,
  Message,
  MessageImage,
  MessageReply,
} from '../types/message.types';
import { upsertMessageInLatestWindow } from '../utils/conversation-cache';
import { isMessage } from '../utils/messages';
import { optimizeChatImages } from '../utils/optimize-chat-images';

const MAX_GALLERY_IMAGES = 4;

type PendingGallery = {
  assets: ImagePicker.ImagePickerAsset[];
  isOptimized?: boolean;
  optimisticMessage: Message;
};

type SelectedGallery = {
  assets: ImagePicker.ImagePickerAsset[];
  replyTo?: MessageReply;
};

type DeliveredGallery = { conversationId: string; message: Message };

type UseChatImageMessagingOptions = {
  conversationId?: string;
  currentUserId?: string;
  onConversationCreated: (delivery: DeliveredGallery) => void;
  onError: (message: string) => void;
  participantId?: string;
  replyingTo: GiftedReplyMessage | null;
  setReplyingTo: (message: GiftedReplyMessage | null) => void;
};

function createClientMessageId() {
  const random = () => Math.random().toString(36).slice(2, 12);
  return `gallery-${Date.now().toString(36)}-${random()}-${random()}`;
}

function fallbackReplyImage(uri: string): MessageImage {
  return {
    url: uri,
    thumbnailUrl: uri,
    width: 1,
    height: 1,
    bytes: 0,
    mimeType: 'image/jpeg',
  };
}

function toReply(replyingTo: GiftedReplyMessage | null): MessageReply | undefined {
  if (!replyingTo) return undefined;
  const images =
    replyingTo.chatImages ?? (replyingTo.image ? [fallbackReplyImage(replyingTo.image)] : []);
  return {
    id: String(replyingTo._id),
    content: replyingTo.text,
    senderId: String(replyingTo.user._id),
    images,
    image: images[0] ?? null,
  };
}

function optimisticImage(asset: ImagePicker.ImagePickerAsset): MessageImage {
  return {
    url: asset.uri,
    thumbnailUrl: asset.uri,
    width: asset.width,
    height: asset.height,
    bytes: asset.fileSize ?? 0,
    mimeType: asset.mimeType ?? 'image/jpeg',
  };
}

export function useChatImageMessaging({
  conversationId,
  currentUserId,
  onConversationCreated,
  onError,
  participantId,
  replyingTo,
  setReplyingTo,
}: UseChatImageMessagingOptions) {
  const pendingGalleries = useRef(new Map<string, PendingGallery>());
  const isConfirmingSelection = useRef(false);
  const [selectedGallery, setSelectedGallery] = useState<SelectedGallery | null>(null);

  const upload = useCallback(
    async (clientMessageId: string) => {
      const pending = pendingGalleries.current.get(clientMessageId);
      if (!pending) return false;

      useChatStore.getState().replaceMessage({
        ...pending.optimisticMessage,
        deliveryStatus: 'sending',
        sendError: undefined,
      });

      try {
        if (!pending.isOptimized) {
          pending.assets = await optimizeChatImages(pending.assets);
          pending.isOptimized = true;
        }
        if (useAuthStore.getState().activeAccountId !== currentUserId) {
          pendingGalleries.current.delete(clientMessageId);
          return true;
        }
        const delivery = await sendChatImages({
          assets: pending.assets,
          clientMessageId,
          conversationId,
          participantId,
          replyToId: pending.optimisticMessage.replyTo?.id,
        });
        if (!delivery.conversationId || !isMessage(delivery.message)) {
          throw new Error('The server returned an invalid gallery message.');
        }
        if (useAuthStore.getState().activeAccountId !== currentUserId) return true;

        const confirmed = { ...delivery.message, conversationId: delivery.conversationId };
        const hasOptimisticMessage = useChatStore
          .getState()
          .activeMessages.some((message) => message.clientMessageId === clientMessageId);
        if (hasOptimisticMessage) useChatStore.getState().addMessage(confirmed);
        useChatStore.getState().updateConversationFromMessage(confirmed);
        upsertMessageInLatestWindow(delivery.conversationId, confirmed);
        pendingGalleries.current.delete(clientMessageId);
        void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
        if (!conversationId) onConversationCreated({ ...delivery, message: confirmed });
      } catch (error) {
        if (useAuthStore.getState().activeAccountId !== currentUserId) return true;
        const message = error instanceof Error ? error.message : 'Photos could not be sent.';
        useChatStore.getState().replaceMessage({
          ...pending.optimisticMessage,
          deliveryStatus: 'failed',
          sendError: message,
        });
        onError(message);
      }
      return true;
    },
    [conversationId, currentUserId, onConversationCreated, onError, participantId],
  );

  const chooseImages = useCallback(async () => {
    if (!currentUserId || (!conversationId && !participantId)) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      onError('Photo access is required to send pictures.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      allowsMultipleSelection: true,
      orderedSelection: true,
      quality: 1,
      selectionLimit: MAX_GALLERY_IMAGES,
    });
    if (result.canceled || result.assets.length === 0) return;

    setSelectedGallery({
      assets: result.assets.slice(0, MAX_GALLERY_IMAGES),
      replyTo: toReply(replyingTo),
    });
    isConfirmingSelection.current = false;
  }, [conversationId, currentUserId, onError, participantId, replyingTo]);

  const cancelImages = useCallback(() => {
    isConfirmingSelection.current = false;
    setSelectedGallery(null);
  }, []);

  const removeSelectedImage = useCallback((index: number) => {
    setSelectedGallery((current) => {
      if (!current) return null;
      const assets = current.assets.filter((_, assetIndex) => assetIndex !== index);
      return assets.length ? { ...current, assets } : null;
    });
  }, []);

  const confirmImages = useCallback(() => {
    if (
      isConfirmingSelection.current ||
      !selectedGallery ||
      !currentUserId ||
      (!conversationId && !participantId)
    )
      return;
    isConfirmingSelection.current = true;

    const { assets, replyTo } = selectedGallery;
    const clientMessageId = createClientMessageId();
    const images = assets.map(optimisticImage);
    const optimisticMessage: Message = {
      id: clientMessageId,
      clientMessageId,
      content: '',
      conversationId,
      createdAt: new Date().toISOString(),
      senderId: currentUserId,
      replyTo,
      images,
      image: images[0] ?? null,
      isOptimistic: true,
      deliveryStatus: 'sending',
    };

    pendingGalleries.current.set(clientMessageId, { assets, optimisticMessage });
    setSelectedGallery(null);
    useChatStore.getState().addMessage(optimisticMessage);
    useChatStore.getState().updateConversationFromMessage(optimisticMessage);
    setReplyingTo(null);
    void upload(clientMessageId);
  }, [conversationId, currentUserId, participantId, selectedGallery, setReplyingTo, upload]);

  const retryImages = useCallback(
    (clientMessageId: string) => {
      if (!pendingGalleries.current.has(clientMessageId)) return false;
      void upload(clientMessageId);
      return true;
    },
    [upload],
  );

  const selectedImages: ChatImageSelection[] =
    selectedGallery?.assets.map(({ height, uri, width }) => ({ height, uri, width })) ?? [];

  return {
    cancelImages,
    chooseImages,
    confirmImages,
    removeSelectedImage,
    retryImages,
    selectedImages,
  };
}
