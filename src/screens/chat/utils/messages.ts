import type {
  GiftedMessage,
  Message,
  MessageImage,
  MessageReply,
  UnsentMessage,
} from '../types/message.types';

type ImageBearingMessage =
  | Pick<Message, 'image' | 'images'>
  | Pick<MessageReply, 'image' | 'images'>;

/** Reads the gallery contract while older payloads still expose only the singular alias. */
export function getMessageImages(message?: ImageBearingMessage | null): MessageImage[] {
  if (!message) return [];
  if (message.images?.length) return message.images;
  return message.image ? [message.image] : [];
}

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
  const isImage = (image: unknown): image is MessageImage => {
    if (!image || typeof image !== 'object') return false;
    const candidate = image as Partial<MessageImage>;
    return (
      typeof candidate.url === 'string' &&
      typeof candidate.thumbnailUrl === 'string' &&
      typeof candidate.width === 'number' &&
      typeof candidate.height === 'number' &&
      typeof candidate.bytes === 'number' &&
      typeof candidate.mimeType === 'string'
    );
  };
  const hasValidImages =
    message.images === undefined ||
    (Array.isArray(message.images) && message.images.length <= 4 && message.images.every(isImage));
  const hasValidImageAlias =
    message.image === undefined || message.image === null || isImage(message.image);
  return (
    typeof message.id === 'string' &&
    typeof message.content === 'string' &&
    typeof message.senderId === 'string' &&
    typeof message.createdAt === 'string' &&
    hasValidImages &&
    hasValidImageAlias
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
  return messageTimeFormatter.format(new Date(value));
}

const messageTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});
