import { create } from 'zustand';

import type { Conversation, Message, UserPresence } from '@/screens/chat/types/message.types';
import { useAuthStore } from '@/shared/store/auth-store';

type ChatState = {
  conversations: Conversation[];
  activeMessages: Message[];
  typingUsers: string[];
  setConversations: (accountId: string, conversations: Conversation[]) => void;
  removeConversation: (conversationId: string) => void;
  updateParticipantPresence: (presence: UserPresence) => void;
  updateConversationFromMessage: (message: Message) => void;
  clearConversationUnread: (conversationId: string) => void;
  addMessage: (message: Message) => void;
  mergeMessages: (messages: Message[]) => void;
  removeMessage: (messageId: string) => void;
  replaceMessage: (message: Message) => void;
  discardMessage: (messageId: string) => void;
  setActiveMessages: (messages: Message[]) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeMessages: [],
  typingUsers: [],
  setConversations: (accountId, conversations) =>
    set((state) =>
      useAuthStore.getState().activeAccountId === accountId ? { conversations } : state,
    ),
  removeConversation: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.filter(
        (conversation) => conversation.id !== conversationId,
      ),
      activeMessages: [],
      typingUsers: [],
    })),
  updateParticipantPresence: (presence) =>
    set((state) => {
      let hasChanged = false;
      const conversations = state.conversations.map((conversation) => {
        if (!conversation.participants.some((participant) => participant.id === presence.userId)) {
          return conversation;
        }

        hasChanged = true;
        return {
          ...conversation,
          participants: conversation.participants.map((participant) =>
            participant.id === presence.userId
              ? {
                  ...participant,
                  isOnline: presence.isOnline,
                  lastSeenAt: presence.lastSeenAt,
                }
              : participant,
          ),
        };
      });

      return hasChanged ? { conversations } : state;
    }),
  updateConversationFromMessage: (message) =>
    set((state) => {
      if (!message.conversationId) return state;

      const conversationIndex = state.conversations.findIndex(
        (conversation) => conversation.id === message.conversationId,
      );
      if (conversationIndex < 0) return state;

      const conversations = [...state.conversations];
      conversations[conversationIndex] = {
        ...conversations[conversationIndex],
        lastMessage: message,
        lastMessagePreview:
          message.content ||
          (message.images && message.images.length > 1
            ? `${message.images.length} photos`
            : message.images?.length || message.image
              ? 'Photo'
              : ''),
        lastMessageTimestamp: message.createdAt,
      };
      conversations.sort((first, second) => {
        const firstTime = new Date(first.lastMessageTimestamp ?? first.createdAt ?? 0).getTime();
        const secondTime = new Date(second.lastMessageTimestamp ?? second.createdAt ?? 0).getTime();
        return secondTime - firstTime;
      });

      return { conversations };
    }),
  clearConversationUnread: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
      ),
    })),
  addMessage: (message) =>
    set((state) => {
      if (state.activeMessages.some((item) => item.id === message.id)) return state;

      const optimisticIndex = state.activeMessages.findIndex(
        (item) =>
          item.isOptimistic &&
          ((message.clientMessageId && item.clientMessageId === message.clientMessageId) ||
            (item.senderId === message.senderId &&
              item.content === message.content &&
              item.replyTo?.id === message.replyTo?.id)),
      );

      if (optimisticIndex >= 0 && !message.isOptimistic) {
        const activeMessages = [...state.activeMessages];
        activeMessages[optimisticIndex] = message;
        return { activeMessages };
      }

      return { activeMessages: [...state.activeMessages, message] };
    }),
  mergeMessages: (messages) =>
    set((state) => {
      if (!messages.length) return state;

      const activeMessages = [...state.activeMessages];
      const messageIndexes = new Map(
        activeMessages.map((message, index) => [message.id, index] as const),
      );

      for (const message of messages) {
        const existingIndex =
          messageIndexes.get(message.id) ??
          (message.clientMessageId
            ? activeMessages.findIndex((item) => item.clientMessageId === message.clientMessageId)
            : -1);
        if (existingIndex === undefined || existingIndex < 0) {
          messageIndexes.set(message.id, activeMessages.length);
          activeMessages.push(message);
        } else if (!message.isOptimistic || activeMessages[existingIndex].isOptimistic) {
          activeMessages[existingIndex] = message;
        }
      }

      return { activeMessages };
    }),
  removeMessage: (messageId) =>
    set((state) => ({
      activeMessages: state.activeMessages.filter((message) => message.id !== messageId),
    })),
  // An unsent message is gone rather than tombstoned: it leaves the thread and any message that
  // quoted it becomes an ordinary message, which is exactly what a refetch now returns.
  discardMessage: (messageId) =>
    set((state) => {
      let hasChanged = false;
      const activeMessages: Message[] = [];

      for (const message of state.activeMessages) {
        if (message.id === messageId) {
          hasChanged = true;
          continue;
        }

        if (message.replyTo?.id === messageId) {
          hasChanged = true;
          activeMessages.push({ ...message, replyTo: null });
          continue;
        }

        activeMessages.push(message);
      }

      return hasChanged ? { activeMessages } : state;
    }),
  // Edits arrive as a whole message that stands in for the one already held.
  replaceMessage: (message) =>
    set((state) => {
      const index = state.activeMessages.findIndex((item) => item.id === message.id);
      if (index < 0) return state;

      const activeMessages = [...state.activeMessages];
      activeMessages[index] = message;
      return { activeMessages };
    }),
  setActiveMessages: (activeMessages) => set({ activeMessages }),
  setTyping: (userId, isTyping) =>
    set((state) => {
      const typingUsers = new Set(state.typingUsers);
      if (isTyping) typingUsers.add(userId);
      else typingUsers.delete(userId);
      return { typingUsers: [...typingUsers] };
    }),
  reset: () => set({ conversations: [], activeMessages: [], typingUsers: [] }),
}));
