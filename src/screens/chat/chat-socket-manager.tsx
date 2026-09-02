import { useEffect } from 'react';

import { queryClient } from '@/providers/query-provider';
import { removeInvalidActiveAccount } from '@/screens/auth/_shared/utils/session-transition';
import { chatQueryKeys, useConversations } from '@/screens/chat/hooks';
import type { Message, UserPresence } from '@/screens/chat/types/message.types';
import { discoverQueryKeys } from '@/screens/discover/hooks';
import { prepareSocketAuth, socket } from '@/shared/lib/socket';
import { useAuthStore } from '@/shared/store/auth-store';
import { useChatStore } from '@/shared/store/chat-store';
import { useUserStore } from '@/shared/store/user.store';

import { useOutboxStore } from './store/outbox-store';
import {
  markParticipantDeletedInCaches,
  updateParticipantPresenceInCache,
  upsertMessageInLatestWindow,
} from './utils/conversation-cache';
import { outboxMessageToOptimisticMessage } from './utils/outbox';

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

function refreshActiveAccountUnreadCount() {
  const accountId = useAuthStore.getState().activeAccountId;
  if (!accountId) return;
  void queryClient.invalidateQueries({ queryKey: chatQueryKeys.unreadCount(accountId) });
}

export function ChatSocketManager() {
  const activeAccountId = useAuthStore((state) => state.activeAccountId);
  const token = useAuthStore((state) => state.token);
  const query = useConversations();
  const conversations = useChatStore((state) => state.conversations);
  const outboxMessages = useOutboxStore((state) => state.messages);
  const setConversations = useChatStore((state) => state.setConversations);
  const updateConversationFromMessage = useChatStore(
    (state) => state.updateConversationFromMessage,
  );
  const updateParticipantPresence = useChatStore((state) => state.updateParticipantPresence);

  useEffect(() => {
    if (!activeAccountId || !query.data?.conversations) return;

    const accountConversations = query.data.conversations.filter((conversation) =>
      conversation.participants.some((participant) => participant.id === activeAccountId),
    );
    setConversations(activeAccountId, accountConversations);
    outboxMessages
      .filter((message) => message.userId === useUserStore.getState().user?.id)
      .sort((first, second) => first.createdAt.localeCompare(second.createdAt))
      .forEach((message) =>
        updateConversationFromMessage(outboxMessageToOptimisticMessage(message)),
      );
  }, [
    activeAccountId,
    outboxMessages,
    query.data,
    setConversations,
    updateConversationFromMessage,
  ]);

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
      upsertMessageInLatestWindow(message.conversationId, message);
      // The server owns unread state. Refresh it after the immediate local preview update.
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      refreshActiveAccountUnreadCount();
    };

    // An unsend can hit any message, and only the server knows whether it was the last one, so the
    // row's preview and unread count are refetched rather than guessed at.
    const handleMessageChanged = () => {
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      refreshActiveAccountUnreadCount();
    };
    const handleParticipantDeleted = (payload: { conversationId: string; userId: string }) => {
      if (!payload.conversationId || !payload.userId) return;
      markParticipantDeletedInCaches(payload.conversationId, payload.userId);
      queryClient.invalidateQueries({ queryKey: discoverQueryKeys.user(payload.userId) });
    };
    const handleAccountDeleted = (payload: { userId: string }) => {
      if (payload.userId !== useAuthStore.getState().activeAccountId) return;
      void removeInvalidActiveAccount();
    };
    const handlePresenceChanged = (presence: UserPresence) => {
      if (
        !activeAccountId ||
        !presence?.userId ||
        typeof presence.isOnline !== 'boolean' ||
        (presence.lastSeenAt !== null && typeof presence.lastSeenAt !== 'string')
      ) {
        return;
      }

      updateParticipantPresence(presence);
      updateParticipantPresenceInCache(activeAccountId, presence);
    };

    socket.on('connect', joinRooms);
    socket.on('receive_message', handleMessage);
    socket.on('message_edited', handleMessageChanged);
    socket.on('message_unsent', handleMessageChanged);
    socket.on('participant_deleted', handleParticipantDeleted);
    socket.on('account_deleted', handleAccountDeleted);
    socket.on('user_presence_changed', handlePresenceChanged);

    if (socket.connected) joinRooms();
    else socket.connect();

    return () => {
      socket.off('connect', joinRooms);
      socket.off('receive_message', handleMessage);
      socket.off('message_edited', handleMessageChanged);
      socket.off('message_unsent', handleMessageChanged);
      socket.off('participant_deleted', handleParticipantDeleted);
      socket.off('account_deleted', handleAccountDeleted);
      socket.off('user_presence_changed', handlePresenceChanged);
    };
  }, [activeAccountId, roomKey, token, updateConversationFromMessage, updateParticipantPresence]);

  useEffect(
    () => () => {
      socket.disconnect();
    },
    [],
  );

  return null;
}
