import { io, type Socket } from 'socket.io-client';

import type { Message, SocketAcknowledgement } from '@/screens/chat/types';
import { useAuthStore } from '@/shared/store/auth-store';

import { API_URL } from './api-client';

type ServerToClientEvents = {
  receive_message: (message: Message) => void;
  user_typing: (payload: { userId: string }) => void;
  user_stop_typing: (payload: { userId: string }) => void;
  chat_error: (payload: { error: string }) => void;
};

type ClientToServerEvents = {
  join_room: (
    conversationId: string,
    acknowledgement?: (response: SocketAcknowledgement) => void,
  ) => void;
  leave_room: (conversationId: string) => void;
  send_message: (
    payload: { conversationId?: string; participantId?: string; content: string },
    acknowledgement?: (response: SocketAcknowledgement) => void,
  ) => void;
  typing: (conversationId: string) => void;
  stop_typing: (conversationId: string) => void;
};

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(API_URL, {
  autoConnect: false,
});

export function prepareSocketAuth() {
  const token = useAuthStore.getState().token;
  socket.auth = token ? { token, authorization: `Bearer ${token}` } : {};
}
