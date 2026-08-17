export type ChatParticipant = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  country: string | null;
};

export type Message = {
  id: string;
  content: string;
  senderId: string;
  conversationId?: string;
  createdAt: string;
  isOptimistic?: boolean;
};

export type Conversation = {
  id: string;
  createdAt?: string;
  participants: ChatParticipant[];
  unreadCount?: number;
  lastMessage?: Message | null;
  lastMessagePreview?: string | null;
  lastMessageTimestamp?: string | null;
  messages?: Message[];
};

export type ConversationsResponse = {
  conversations: Conversation[];
};

export type ConversationResponse = {
  conversation: Conversation & { messages: Message[] };
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
