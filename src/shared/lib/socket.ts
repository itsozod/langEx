import { io, type Socket } from 'socket.io-client';

import type {
  ConversationReadResponse,
  Message,
  ParticipantDeleted,
  SocketAcknowledgement,
  UnsentMessage,
} from '@/screens/chat/types/message.types';
import { useAuthStore } from '@/shared/store/auth-store';

import { API_URL } from './api-client';

type ServerToClientEvents = {
  receive_message: (message: Message) => void;
  message_edited: (message: Message) => void;
  // Unsend carries only a tombstone; the message it names is dropped rather than replaced.
  message_unsent: (message: UnsentMessage) => void;
  user_typing: (payload: { userId: string }) => void;
  user_stop_typing: (payload: { userId: string }) => void;
  chat_error: (payload: { error: string }) => void;
  conversation_read: (payload: ConversationReadResponse) => void;
  participant_deleted: (payload: ParticipantDeleted) => void;
  account_deleted: (payload: { userId: string }) => void;
  user_presence_changed: (presence: {
    userId: string;
    isOnline: boolean;
    lastSeenAt: string | null;
  }) => void;
};

type ClientToServerEvents = {
  active_conversation: (conversationId: string | null) => void;
  join_room: (
    conversationId: string,
    acknowledgement?: (response: SocketAcknowledgement) => void,
  ) => void;
  leave_room: (conversationId: string) => void;
  send_message: (
    payload: {
      conversationId?: string;
      participantId?: string;
      clientMessageId: string;
      content: string;
      replyToId?: string;
    },
    acknowledgement?: (response: SocketAcknowledgement) => void,
  ) => void;
  typing: (conversationId: string) => void;
  stop_typing: (conversationId: string) => void;
};

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(API_URL, {
  autoConnect: false,
});

let connectedToken: string | null = null;

function configuredToken() {
  const auth = socket.auth as { token?: unknown } | undefined;
  return typeof auth?.token === 'string' ? auth.token : null;
}

socket.on('connect', () => {
  connectedToken = configuredToken();
});

socket.on('disconnect', () => {
  connectedToken = null;
});

export function prepareSocketAuth() {
  const nextToken = useAuthStore.getState().token;
  const isConnectedAsAnotherAccount = socket.connected && connectedToken !== nextToken;
  const isConnectingAsAnotherAccount =
    !socket.connected && socket.active && configuredToken() !== nextToken;

  // Socket.IO only reads auth during the handshake. Updating `socket.auth` on an existing
  // connection does not change `socket.data.user` on the server, so account changes must force a
  // fresh connection before any room is joined.
  if (isConnectedAsAnotherAccount || isConnectingAsAnotherAccount) socket.disconnect();

  socket.auth = nextToken ? { token: nextToken, authorization: `Bearer ${nextToken}` } : {};
}
