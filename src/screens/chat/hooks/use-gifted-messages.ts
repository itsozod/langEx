import { useMemo } from 'react';

import type {
  ChatParticipant,
  GiftedMessage,
  Message,
  MessageImage,
  MessageReply,
} from '../types/message.types';
import { getMessageImages } from '../utils/messages';

type ImageBearingMessage =
  | Pick<Message, 'image' | 'images'>
  | Pick<MessageReply, 'image' | 'images'>;

function optionalImages(message?: ImageBearingMessage | null): MessageImage[] | undefined {
  const images = getMessageImages(message);
  return images.length ? images : undefined;
}

// Raw messages are treated as immutable throughout the query/store pipeline. Weak keys let evicted
// pages be collected while unchanged rows retain the same Gifted Chat object across pagination.
const giftedMessageCache = new WeakMap<Message, Map<string, GiftedMessage>>();

/**
 * Converts the bounded server window into Gifted Chat rows while retaining object identity for
 * unchanged messages. FlatList can then skip old rows when pagination adds only one new page.
 */
export function useGiftedMessages(
  messages: Message[],
  participants: ChatParticipant[] = [],
  currentUserId?: string,
  participantReadAt?: string,
) {
  return useMemo(() => {
    const participantById = new Map(
      participants.map((participant) => [participant.id, participant]),
    );
    const readAtTime = participantReadAt ? Date.parse(participantReadAt) : Number.NaN;
    const giftedMessages: GiftedMessage[] = [];

    for (const message of messages) {
      const sender = participantById.get(message.senderId);
      const replySender = message.replyTo
        ? participantById.get(message.replyTo.senderId)
        : undefined;
      const senderName =
        sender?.displayName || (message.senderId === currentUserId ? 'You' : 'Partner');
      const senderAvatar = sender?.avatarUrl || undefined;
      const replySenderName = message.replyTo
        ? replySender?.displayName ||
          (message.replyTo.senderId === currentUserId ? 'You' : 'Partner')
        : '';
      const replySenderAvatar = replySender?.avatarUrl || undefined;
      const createdAtTime = Date.parse(message.createdAt);
      const deliveryReceipt: 'sent' | 'read' | undefined =
        message.senderId === currentUserId && !message.isOptimistic
          ? Number.isFinite(readAtTime) && createdAtTime <= readAtTime
            ? 'read'
            : 'sent'
          : undefined;
      const cacheKey = [
        currentUserId,
        deliveryReceipt,
        senderName,
        senderAvatar,
        replySenderName,
        replySenderAvatar,
      ].join('\u0000');
      const cached = giftedMessageCache.get(message)?.get(cacheKey);

      if (cached) {
        giftedMessages.push(cached);
        continue;
      }

      const images = optionalImages(message);
      const replyImages = optionalImages(message.replyTo);
      const giftedMessage: GiftedMessage = {
        _id: message.id,
        text: message.content,
        image: images?.[0]?.thumbnailUrl,
        chatImages: images,
        createdAt: new Date(createdAtTime),
        pending: Boolean(message.deliveryStatus ?? message.isOptimistic),
        deliveryStatus: message.deliveryStatus,
        sendError: message.sendError,
        deliveryReceipt,
        editedAt: message.editedAt,
        user: {
          _id: message.senderId,
          name: senderName,
          avatar: senderAvatar,
        },
        replyMessage: message.replyTo
          ? {
              _id: message.replyTo.id,
              text: message.replyTo.content,
              image: replyImages?.[0]?.thumbnailUrl,
              chatImages: replyImages,
              user: {
                _id: message.replyTo.senderId,
                name: replySenderName,
                avatar: replySenderAvatar,
              },
            }
          : undefined,
      };
      const sourceCache = giftedMessageCache.get(message) ?? new Map<string, GiftedMessage>();
      sourceCache.set(cacheKey, giftedMessage);
      giftedMessageCache.set(message, sourceCache);
      giftedMessages.push(giftedMessage);
    }

    // FlashList renders chat data in visual order and starts from the bottom. Keeping the array
    // oldest-first avoids inversion transforms and makes its start/end pagination semantics exact.
    giftedMessages.sort((first, second) => Number(first.createdAt) - Number(second.createdAt));
    return giftedMessages;
  }, [currentUserId, messages, participantReadAt, participants]);
}
