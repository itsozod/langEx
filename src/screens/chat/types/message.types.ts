import type { IMessage, ReplyMessage } from 'react-native-gifted-chat';

export type GiftedReplyMessage = ReplyMessage & {
  chatImages?: MessageImage[];
};

export type GiftedMessage = Omit<IMessage, 'replyMessage'> & {
  chatImages?: MessageImage[];
  deliveryReceipt?: 'sent' | 'read';
  deliveryStatus?: OutgoingMessageStatus;
  sendError?: string;
  pending?: boolean;
  /** Non-null means the sender changed the text after sending. */
  editedAt?: string | null;
  replyMessage?: GiftedReplyMessage;
};

export type OutgoingMessageStatus = 'queued' | 'sending' | 'failed';

export type ChatParticipant = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  country: string | null;
  isDeleted: boolean;
  isOnline?: boolean;
  lastSeenAt?: string | null;
};

export type MessageReply = {
  id: string;
  content: string;
  senderId: string;
  image?: MessageImage | null;
  images?: MessageImage[];
};

export type MessageImage = {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  bytes: number;
  mimeType: string;
};

export type ChatImageSelection = Pick<MessageImage, 'width' | 'height'> & {
  uri: string;
};

export type Message = {
  id: string;
  clientMessageId?: string | null;
  content: string;
  image?: MessageImage | null;
  images?: MessageImage[];
  senderId: string;
  conversationId?: string;
  createdAt: string;
  replyTo?: MessageReply | null;
  isOptimistic?: boolean;
  deliveryStatus?: OutgoingMessageStatus;
  sendError?: string;
  editedAt?: string | null;
  /** Only ever seen on a `message_unsent` payload; unsent messages are dropped, never rendered. */
  deletedAt?: string | null;
};

export type OutboxMessage = {
  clientMessageId: string;
  userId: string;
  conversationId?: string;
  participantId?: string;
  content: string;
  replyToId?: string;
  replyTo?: MessageReply;
  createdAt: string;
  status: OutgoingMessageStatus;
  attemptCount: number;
  nextAttemptAt: number;
  error?: string;
};

/**
 * `message_unsent` carries a tombstone rather than a message: the text is gone, so there is nothing
 * to send beyond the identity of what to drop.
 */
export type UnsentMessage = {
  id: string;
  conversationId?: string;
  deletedAt: string;
};

export type Conversation = {
  id: string;
  createdAt?: string;
  participants: ChatParticipant[];
  isReadOnly: boolean;
  unreadCount?: number;
  lastMessage?: Message | null;
  lastMessagePreview?: string | null;
  lastMessageTimestamp?: string | null;
  lastMessageEditedAt?: string | null;
  messages?: Message[];
  reads?: ConversationReadState[];
};

export type ConversationReadState = {
  userId: string;
  lastReadAt: string;
};

export type ConversationsResponse = {
  conversations: Conversation[];
};

export type ConversationsUnreadCountResponse = {
  unreadCount: number;
};

export type DeleteConversationResponse = {
  success: true;
  conversationId: string;
  clearedAt: string;
};

export type UserPresence = {
  userId: string;
  isOnline: boolean;
  lastSeenAt: string | null;
};

export type UserPresenceResponse = {
  presence: UserPresence;
};

export type ConversationPageInfo = {
  hasMore: boolean;
  hasMoreNewer: boolean;
  newerCursor: string | null;
  olderCursor: string | null;
};

export type ConversationResponse = {
  conversation: Conversation & { messages: Message[] };
  pageInfo: ConversationPageInfo;
};

export type DirectConversationResponse = {
  conversationId: string | null;
};

export type ConversationReadResponse = {
  conversationId: string;
  userId: string;
  unreadCount: number;
  lastReadAt: string;
};

export type ParticipantDeleted = {
  conversationId: string;
  userId: string;
};

export type SocketAcknowledgement = {
  ok: boolean;
  error?: string;
  conversationId?: string;
  message?: Message;
};

export type SendImageResponse = {
  conversationId: string;
  message: Message;
};
