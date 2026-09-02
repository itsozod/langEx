import { apiRequest } from '@/shared/lib/api-client';

import type {
  ConversationReadResponse,
  ConversationResponse,
  ConversationsResponse,
  ConversationsUnreadCountResponse,
  DeleteConversationResponse,
  DirectConversationResponse,
  Message,
  UserPresenceResponse,
} from './types/message.types';

export function getConversations() {
  return apiRequest<ConversationsResponse>('/conversations');
}

export function getConversationsUnreadCount() {
  return apiRequest<ConversationsUnreadCountResponse>('/conversations/unread-count');
}

export function deleteConversation(conversationId: string) {
  return apiRequest<DeleteConversationResponse>(
    `/conversations/${encodeURIComponent(conversationId)}`,
    { method: 'DELETE' },
  );
}

export function getUserPresence(userId: string) {
  return apiRequest<UserPresenceResponse>(`/users/${encodeURIComponent(userId)}/presence`);
}

/**
 * A window is either the newest messages, the page next to a cursor, or the page centred on a
 * specific message. The modes are mutually exclusive; the backend rejects combinations.
 */
export type ConversationWindowParams = {
  after?: string;
  around?: string;
  before?: string;
};

export function getConversation(conversationId: string, window: ConversationWindowParams = {}) {
  const query = new URLSearchParams({ limit: '40' });
  if (window.around) query.set('around', window.around);
  else if (window.after) query.set('after', window.after);
  else if (window.before) query.set('before', window.before);

  return apiRequest<ConversationResponse>(
    `/conversations/${encodeURIComponent(conversationId)}?${query.toString()}`,
    { timeout: 30_000 },
  );
}

/** Sender-only. Re-sending identical content is a no-op that leaves `editedAt` alone. */
export function editMessage(conversationId: string, messageId: string, content: string) {
  return apiRequest<{ message?: Message }>(
    `/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`,
    { method: 'PATCH', body: { content } },
  );
}

/** Sender-only. The server clears the stored text and keeps the row as a tombstone. */
export function unsendMessage(conversationId: string, messageId: string) {
  return apiRequest<{ message?: Message }>(
    `/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`,
    { method: 'DELETE' },
  );
}

export function findDirectConversation(participantId: string) {
  return apiRequest<DirectConversationResponse>(
    `/conversations/direct/${encodeURIComponent(participantId)}`,
  );
}

export function markConversationRead(conversationId: string) {
  return apiRequest<ConversationReadResponse>(
    `/conversations/${encodeURIComponent(conversationId)}/read`,
    {
      method: 'POST',
    },
  );
}
