import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

import { apiClient, apiRequest, UPLOAD_TIMEOUT_MS } from '@/shared/lib/api-client';

import type {
  ConversationReadResponse,
  ConversationResponse,
  ConversationsResponse,
  ConversationsUnreadCountResponse,
  DeleteConversationResponse,
  DirectConversationResponse,
  Message,
  SendImageResponse,
  UserPresenceResponse,
} from './types/message.types';

type SendChatImagesInput = {
  assets: ImagePickerAsset[];
  clientMessageId: string;
  conversationId?: string;
  participantId?: string;
  replyToId?: string;
};

function imageFileName(asset: ImagePickerAsset, index: number) {
  if (asset.fileName) return asset.fileName;
  const extension = asset.mimeType?.split('/')[1] ?? 'jpg';
  return `chat-photo-${index + 1}.${extension}`;
}

export async function sendChatImages({
  assets,
  clientMessageId,
  conversationId,
  participantId,
  replyToId,
}: SendChatImagesInput) {
  if (assets.length < 1 || assets.length > 4) {
    throw new Error('Choose between one and four photos.');
  }
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const blobs = await Promise.all(
      assets.map(async (asset) => {
        const fileResponse = await fetch(asset.uri);
        return fileResponse.blob();
      }),
    );
    blobs.forEach((blob, index) => {
      formData.append('images', blob, imageFileName(assets[index], index));
    });
  } else {
    assets.forEach((asset, index) => {
      formData.append('images', {
        uri: asset.uri,
        name: imageFileName(asset, index),
        type: asset.mimeType ?? 'image/jpeg',
      } as unknown as Blob);
    });
  }

  formData.append('clientMessageId', clientMessageId);
  if (conversationId) formData.append('conversationId', conversationId);
  if (participantId) formData.append('participantId', participantId);
  if (replyToId) formData.append('replyToId', replyToId);

  const response = await apiClient.post<SendImageResponse>('/conversations/images', formData, {
    timeout: UPLOAD_TIMEOUT_MS,
  });
  return response.data;
}

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
 * A window is either the newest messages, an older page, or the page centred on a specific
 * message. The modes are mutually exclusive; the backend rejects combinations.
 */
export type ConversationWindowParams = {
  after?: string;
  around?: string;
  before?: string;
};

const CONVERSATION_WINDOW_MESSAGE_LIMIT = 24;

export function getConversation(conversationId: string, window: ConversationWindowParams = {}) {
  const query = new URLSearchParams({ limit: String(CONVERSATION_WINDOW_MESSAGE_LIMIT) });
  if (window.around) query.set('around', window.around);
  else if (window.before) query.set('before', window.before);
  else if (window.after) query.set('after', window.after);

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
