import { apiRequest } from '@/shared/lib/api-client';

import type {
  ConversationResponse,
  ConversationReadResponse,
  ConversationsResponse,
  DirectConversationResponse,
} from './types';

export function getConversations() {
  return apiRequest<ConversationsResponse>('/conversations');
}

export function getConversation(conversationId: string) {
  return apiRequest<ConversationResponse>(`/conversations/${encodeURIComponent(conversationId)}`);
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
