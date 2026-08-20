import type { ChatParticipant, GiftedMessage, Message, UnsentMessage } from '../types';

export function getInitials(name?: string | null) {
  const value = name?.trim() || 'Language partner';
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<Message>;
  return (
    typeof message.id === 'string' &&
    typeof message.content === 'string' &&
    typeof message.senderId === 'string' &&
    typeof message.createdAt === 'string'
  );
}

export function isUnsentMessage(value: unknown): value is UnsentMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<UnsentMessage>;
  return typeof message.id === 'string';
}

export function isSameSenderOnSameDay(first?: GiftedMessage, second?: GiftedMessage) {
  const firstUserId = first?.user?._id;
  const secondUserId = second?.user?._id;
  if (firstUserId == null || secondUserId == null || firstUserId !== secondUserId) return false;

  const firstCreatedAt = first?.createdAt;
  const secondCreatedAt = second?.createdAt;
  if (firstCreatedAt == null || secondCreatedAt == null) return false;

  const firstDate = new Date(firstCreatedAt);
  const secondDate = new Date(secondCreatedAt);
  if (Number.isNaN(firstDate.getTime()) || Number.isNaN(secondDate.getTime())) return false;

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

export function formatMessageTime(value: Date | number) {
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function toGiftedMessages(
  messages: Message[],
  participants: ChatParticipant[] = [],
  currentUserId?: string,
): GiftedMessage[] {
  return messages
    .map((message) => {
      const sender = participants.find((participant) => participant.id === message.senderId);
      const replySender = message.replyTo
        ? participants.find((participant) => participant.id === message.replyTo?.senderId)
        : undefined;

      return {
        _id: message.id,
        text: message.content,
        createdAt: new Date(message.createdAt),
        pending: message.isOptimistic,
        editedAt: message.editedAt,
        user: {
          _id: message.senderId,
          name: sender?.displayName || (message.senderId === currentUserId ? 'You' : 'Partner'),
          avatar: sender?.avatarUrl || undefined,
        },
        replyMessage: message.replyTo
          ? {
              _id: message.replyTo.id,
              text: message.replyTo.content,
              user: {
                _id: message.replyTo.senderId,
                name:
                  replySender?.displayName ||
                  (message.replyTo.senderId === currentUserId ? 'You' : 'Partner'),
                avatar: replySender?.avatarUrl || undefined,
              },
            }
          : undefined,
      } satisfies GiftedMessage;
    })
    .sort((first, second) => Number(second.createdAt) - Number(first.createdAt));
}
