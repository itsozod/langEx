import { create } from 'zustand';

import type { Conversation, Message } from '@/screens/chat/types';

type ChatState = {
  conversations: Conversation[];
  activeMessages: Message[];
  typingUsers: string[];
  setConversations: (conversations: Conversation[]) => void;
  updateConversationFromMessage: (message: Message) => void;
  clearConversationUnread: (conversationId: string) => void;
  addMessage: (message: Message) => void;
  mergeMessages: (messages: Message[]) => void;
  removeMessage: (messageId: string) => void;
  setActiveMessages: (messages: Message[]) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeMessages: [],
  typingUsers: [],
  setConversations: (conversations) => set({ conversations }),
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
        lastMessagePreview: message.content,
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
          item.senderId === message.senderId &&
          item.content === message.content &&
          item.replyTo?.id === message.replyTo?.id,
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
        const existingIndex = messageIndexes.get(message.id);
        if (existingIndex === undefined) {
          messageIndexes.set(message.id, activeMessages.length);
          activeMessages.push(message);
        } else if (!activeMessages[existingIndex].isOptimistic) {
          activeMessages[existingIndex] = message;
        }
      }

      return { activeMessages };
    }),
  removeMessage: (messageId) =>
    set((state) => ({
      activeMessages: state.activeMessages.filter((message) => message.id !== messageId),
    })),
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
