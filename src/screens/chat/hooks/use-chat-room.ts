import { useCallback, useEffect, useRef, useState } from 'react';

import { queryClient } from '@/providers/query-provider';
import { prepareSocketAuth, socket } from '@/shared/lib/socket';
import { useChatStore } from '@/shared/store/chatStore';

import { markConversationRead as markConversationReadRequest } from '../api';
import { chatQueryKeys } from '../hooks';
import type { ConversationsResponse, Message, UnsentMessage } from '../types';
import { discardMessageFromWindows, replaceMessageInWindows } from '../utils/conversation-cache';
import { isMessage, isUnsentMessage } from '../utils/messages';

type UseChatRoomOptions = {
  conversationId?: string;
  currentUserId?: string;
  isHistoricalWindow: boolean;
  token: string | null;
};

export function useChatRoom({
  conversationId,
  currentUserId,
  isHistoricalWindow,
  token,
}: UseChatRoomOptions) {
  const addMessage = useChatStore((state) => state.addMessage);
  const replaceMessage = useChatStore((state) => state.replaceMessage);
  const discardMessage = useChatStore((state) => state.discardMessage);
  const setTyping = useChatStore((state) => state.setTyping);
  const clearConversationUnread = useChatStore((state) => state.clearConversationUnread);
  const [socketError, setSocketError] = useState<string | null>(null);
  // Read inside the socket handlers so switching windows does not resubscribe them.
  const isHistoricalWindowRef = useRef(isHistoricalWindow);

  useEffect(() => {
    isHistoricalWindowRef.current = isHistoricalWindow;
  }, [isHistoricalWindow]);

  const markConversationRead = useCallback(async () => {
    if (!token || !conversationId) return;

    clearConversationUnread(conversationId);

    try {
      const readState = await markConversationReadRequest(conversationId);
      queryClient.setQueryData<ConversationsResponse>(chatQueryKeys.conversations(), (current) =>
        current
          ? {
              ...current,
              conversations: current.conversations.map((item) =>
                item.id === readState.conversationId
                  ? { ...item, unreadCount: readState.unreadCount }
                  : item,
              ),
            }
          : current,
      );
    } catch {
      void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
    }
  }, [clearConversationUnread, conversationId, token]);

  useEffect(() => {
    void markConversationRead();
  }, [markConversationRead]);

  useEffect(() => {
    if (!conversationId) return;

    prepareSocketAuth();

    const joinRoom = () => {
      socket.emit('join_room', conversationId, (response) => {
        if (!response.ok) setSocketError(response.error ?? 'Unable to join this chat.');
      });
    };
    const handleMessage = (message: Message) => {
      if (
        isMessage(message) &&
        (!message.conversationId || message.conversationId === conversationId)
      ) {
        // A message that just arrived must not be appended to a window from months ago; it would
        // render as if it belonged there. It reaches the thread when the latest window comes back.
        if (!isHistoricalWindowRef.current) addMessage(message);
        if (message.senderId !== currentUserId) void markConversationRead();
      }
    };
    // Edits and unsends apply in a historical window too: unlike a new message, they act on a
    // message that may well be on screen.
    const handleMessageEdited = (message: Message) => {
      if (!isMessage(message)) return;
      if (message.conversationId && message.conversationId !== conversationId) return;

      replaceMessage(message);
      replaceMessageInWindows(conversationId, message);
    };
    const handleMessageUnsent = (message: UnsentMessage) => {
      if (!isUnsentMessage(message)) return;
      if (message.conversationId && message.conversationId !== conversationId) return;

      discardMessage(message.id);
      discardMessageFromWindows(conversationId, message.id);
    };
    const handleTyping = ({ userId }: { userId: string }) => {
      if (userId !== currentUserId) setTyping(userId, true);
    };
    const handleStopTyping = ({ userId }: { userId: string }) => setTyping(userId, false);
    const handleChatError = ({ error }: { error: string }) => setSocketError(error);
    const handleConnectError = (error: Error) => setSocketError(error.message);

    socket.on('connect', joinRoom);
    socket.on('receive_message', handleMessage);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_unsent', handleMessageUnsent);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    socket.on('chat_error', handleChatError);
    socket.on('connect_error', handleConnectError);

    if (socket.connected) joinRoom();
    else socket.connect();

    return () => {
      socket.emit('stop_typing', conversationId);
      socket.off('connect', joinRoom);
      socket.off('receive_message', handleMessage);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_unsent', handleMessageUnsent);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
      socket.off('chat_error', handleChatError);
      socket.off('connect_error', handleConnectError);
      useChatStore.setState({ typingUsers: [] });
      void queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      // Prefix match so every anchored window for this conversation is dropped, not just the newest.
      queryClient.removeQueries({ queryKey: chatQueryKeys.conversation(conversationId) });
    };
  }, [
    addMessage,
    conversationId,
    currentUserId,
    discardMessage,
    markConversationRead,
    replaceMessage,
    setTyping,
  ]);

  return { socketError, setSocketError };
}
