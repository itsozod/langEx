import { useEffect } from 'react';

import { chatQueryKeys, useConversations } from '@/screens/chat/hooks';
import type { Message } from '@/screens/chat/types';
import { prepareSocketAuth, socket } from '@/shared/lib/socket';
import { queryClient } from '@/providers/query-provider';
import { useAuthStore } from '@/shared/store/auth-store';
import { useChatStore } from '@/shared/store/chatStore';

function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<Message>;
  return (
    typeof message.id === 'string' &&
    typeof message.content === 'string' &&
    typeof message.senderId === 'string' &&
    typeof message.createdAt === 'string'
  );
}

export function ChatSocketManager() {
  const token = useAuthStore((state) => state.token);
  const query = useConversations();
  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  const updateConversationFromMessage = useChatStore(
    (state) => state.updateConversationFromMessage,
  );

  useEffect(() => {
    if (query.data?.conversations) setConversations(query.data.conversations);
  }, [query.data, setConversations]);

  const roomKey = conversations
    .map((conversation) => conversation.id)
    .sort()
    .join('|');

  useEffect(() => {
    if (!token) {
      socket.disconnect();
      return;
    }

    prepareSocketAuth();

    const roomIds = roomKey ? roomKey.split('|') : [];
    const joinRooms = () => {
      roomIds.forEach((conversationId) => socket.emit('join_room', conversationId));
    };
    const handleMessage = (message: Message) => {
      if (!isMessage(message)) return;

      updateConversationFromMessage(message);
      // The server owns unread state. Refresh it after the immediate local preview update.
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
    };

    // An unsend can hit any message, and only the server knows whether it was the last one, so the
    // row's preview and unread count are refetched rather than guessed at.
    const handleMessageChanged = () => {
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
    };

    socket.on('connect', joinRooms);
    socket.on('receive_message', handleMessage);
    socket.on('message_edited', handleMessageChanged);
    socket.on('message_unsent', handleMessageChanged);

    if (socket.connected) joinRooms();
    else socket.connect();

    return () => {
      socket.off('connect', joinRooms);
      socket.off('receive_message', handleMessage);
      socket.off('message_edited', handleMessageChanged);
      socket.off('message_unsent', handleMessageChanged);
    };
  }, [roomKey, token, updateConversationFromMessage]);

  useEffect(
    () => () => {
      socket.disconnect();
    },
    [],
  );

  return null;
}
