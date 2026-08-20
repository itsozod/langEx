import type { IMessage } from 'react-native-gifted-chat';

export type GiftedMessage = IMessage & {
  pending?: boolean;
  /** Non-null means the sender changed the text after sending. */
  editedAt?: string | null;
};

export type ChatParticipant = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  country: string | null;
};

export type MessageReply = {
  id: string;
  content: string;
  senderId: string;
};

export type Message = {
  id: string;
  content: string;
  senderId: string;
  conversationId?: string;
  createdAt: string;
  replyTo?: MessageReply | null;
  isOptimistic?: boolean;
  editedAt?: string | null;
  /** Only ever seen on a `message_unsent` payload; unsent messages are dropped, never rendered. */
  deletedAt?: string | null;
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
  unreadCount?: number;
  lastMessage?: Message | null;
  lastMessagePreview?: string | null;
  lastMessageTimestamp?: string | null;
  lastMessageEditedAt?: string | null;
  messages?: Message[];
};

export type ConversationsResponse = {
  conversations: Conversation[];
};

export type ConversationPageInfo = {
  hasMore: boolean;
  olderCursor: string | null;
  hasMoreNewer?: boolean;
  newerCursor?: string | null;
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
  unreadCount: number;
  lastReadAt: string;
};

export type SocketAcknowledgement = {
  ok: boolean;
  error?: string;
  conversationId?: string;
  message?: Message;
};
