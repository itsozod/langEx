import { router, usePathname } from 'expo-router';
import { useEffect } from 'react';

import { queryClient } from '@/providers/query-provider';
import { removeInvalidActiveAccount } from '@/screens/auth/_shared/utils/session-transition';
import { chatQueryKeys, useConversations } from '@/screens/chat/hooks';
import type {
  Conversation,
  ConversationsResponse,
  Message,
  UserPresence,
} from '@/screens/chat/types/message.types';
import { discoverQueryKeys } from '@/screens/discover/hooks';
import { prepareSocketAuth, socket } from '@/shared/lib/socket';
import { useAuthStore } from '@/shared/store/auth-store';
import { useChatStore } from '@/shared/store/chat-store';
import { useUserStore } from '@/shared/store/user.store';

import { useOutboxStore } from './store/outbox-store';
import {
  markParticipantDeletedInCaches,
  removeConversationFromListCache,
  updateGroupMembershipInCaches,
  updateGroupRolesInCaches,
  updateParticipantPresenceInCache,
  upsertMessageInLatestWindow,
} from './utils/conversation-cache';
import { isMessage } from './utils/messages';
import { outboxMessageToOptimisticMessage } from './utils/outbox';

function refreshActiveAccountUnreadCount() {
  const accountId = useAuthStore.getState().activeAccountId;
  if (!accountId) return;
  void queryClient.invalidateQueries({ queryKey: chatQueryKeys.unreadCount(accountId) });
}

export function ChatSocketManager() {
  const activeAccountId = useAuthStore((state) => state.activeAccountId);
  const pathname = usePathname();
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
    const handleConversationCreated = (payload: { conversation?: Conversation }) => {
      const conversation = payload?.conversation;
      if (!conversation?.id || !activeAccountId) return;

      queryClient.setQueryData<ConversationsResponse>(
        chatQueryKeys.conversations(activeAccountId),
        (current) => ({
          conversations: [
            conversation,
            ...(current?.conversations.filter((item) => item.id !== conversation.id) ?? []),
          ],
        }),
      );
      void queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversations(activeAccountId),
      });
    };
    const handleParticipantsChanged = (payload: {
      conversationId?: string;
      removedParticipantIds?: string[];
      ownerId?: string;
      adminIds?: string[];
      participants?: Conversation['participants'];
    }) => {
      if (!payload?.conversationId || !activeAccountId) return;
      if (payload.removedParticipantIds?.includes(activeAccountId)) {
        removeConversationFromListCache(payload.conversationId);
        useChatStore.getState().removeConversation(payload.conversationId);
        queryClient.removeQueries({
          queryKey: chatQueryKeys.conversation(payload.conversationId, activeAccountId),
        });
        const chatPath = `/chat/${payload.conversationId}`;
        const groupPath = `/group/${payload.conversationId}`;
        if (pathname === chatPath || pathname.startsWith(groupPath)) {
          router.replace('/(tabs)/chats');
        }
        return;
      }
      if (
        payload.participants &&
        typeof payload.ownerId === 'string' &&
        Array.isArray(payload.adminIds)
      ) {
        updateGroupMembershipInCaches(payload.conversationId, {
          participants: payload.participants,
          createdById: payload.ownerId,
          adminIds: payload.adminIds,
        });
      }
      void queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversations(activeAccountId),
      });
      void queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversation(payload.conversationId, activeAccountId),
      });
    };
    const handleRolesChanged = (payload: {
      conversationId?: string;
      ownerId?: string;
      adminIds?: string[];
    }) => {
      if (
        !payload?.conversationId ||
        !activeAccountId ||
        typeof payload.ownerId !== 'string' ||
        !Array.isArray(payload.adminIds)
      ) {
        return;
      }
      updateGroupRolesInCaches(payload.conversationId, payload.ownerId, payload.adminIds);
      void queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversations(activeAccountId),
      });
      void queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversation(payload.conversationId, activeAccountId),
      });
    };

    // An unsend can hit any message, and only the server knows whether it was the last one, so the
    // row's preview and unread count are refetched rather than guessed at.
    const handleMessageChanged = () => {
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      refreshActiveAccountUnreadCount();
    };
    const handlePinsChanged = (payload: { conversationId: string }) => {
      if (!payload?.conversationId) return;
      void queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversation(payload.conversationId),
      });
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
    socket.on('conversation_created', handleConversationCreated);
    socket.on('conversation_participants_changed', handleParticipantsChanged);
    socket.on('conversation_roles_changed', handleRolesChanged);
    socket.on('message_edited', handleMessageChanged);
    socket.on('message_unsent', handleMessageChanged);
    socket.on('conversation_pins_changed', handlePinsChanged);
    socket.on('participant_deleted', handleParticipantDeleted);
    socket.on('account_deleted', handleAccountDeleted);
    socket.on('user_presence_changed', handlePresenceChanged);

    if (socket.connected) joinRooms();
    else socket.connect();

    return () => {
      socket.off('connect', joinRooms);
      socket.off('receive_message', handleMessage);
      socket.off('conversation_created', handleConversationCreated);
      socket.off('conversation_participants_changed', handleParticipantsChanged);
      socket.off('conversation_roles_changed', handleRolesChanged);
      socket.off('message_edited', handleMessageChanged);
      socket.off('message_unsent', handleMessageChanged);
      socket.off('conversation_pins_changed', handlePinsChanged);
      socket.off('participant_deleted', handleParticipantDeleted);
      socket.off('account_deleted', handleAccountDeleted);
      socket.off('user_presence_changed', handlePresenceChanged);
    };
  }, [
    activeAccountId,
    pathname,
    roomKey,
    token,
    updateConversationFromMessage,
    updateParticipantPresence,
  ]);

  useEffect(
    () => () => {
      socket.disconnect();
    },
    [],
  );

  return null;
}
