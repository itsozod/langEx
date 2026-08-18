import { apiRequest } from '@/shared/lib/api-client';

import type {
  ConversationReadResponse,
  ConversationResponse,
  ConversationsResponse,
  DirectConversationResponse,
} from './types';

export function getConversations() {
  return apiRequest<ConversationsResponse>('/conversations');
}

export function getConversation(conversationId: string, before?: string | null) {
  const query = new URLSearchParams({ limit: '40' });
  if (before) query.set('before', before);

  return apiRequest<ConversationResponse>(
    `/conversations/${encodeURIComponent(conversationId)}?${query.toString()}`,
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
