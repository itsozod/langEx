import type { InfiniteData } from '@tanstack/react-query';

import { queryClient } from '@/providers/query-provider';

import type { ConversationWindowParams } from '../api';
import { chatQueryKeys } from '../hooks';
import type {
  Conversation,
  ConversationResponse,
  ConversationsResponse,
  Message,
} from '../types/message.types';

type ConversationWindows = InfiniteData<ConversationResponse, ConversationWindowParams>;

/**
 * Messages live in two places: the store the thread renders from, and the query pages they were
 * merged out of. Correcting only the store is not enough — loading another page re-runs the merge
 * and the stale copy comes back, which is why an unsent message reappeared after scrolling up.
 *
 * Every window of the conversation is patched, anchored ones included, since a jump keeps its own
 * cached pages alongside the newest window.
 */
function updateWindows(
  conversationId: string | undefined,
  updateMessages: (messages: Message[]) => Message[],
) {
  if (!conversationId) return;

  queryClient.setQueriesData<ConversationWindows>(
    { queryKey: chatQueryKeys.conversation(conversationId) },
    (windows) =>
      windows
        ? {
            ...windows,
            pages: windows.pages.map((page) => ({
              ...page,
              conversation: {
                ...page.conversation,
                messages: updateMessages(page.conversation.messages),
              },
            })),
          }
        : windows,
  );
}

export function discardMessageFromWindows(conversationId: string | undefined, messageId: string) {
  updateWindows(conversationId, (messages) =>
    messages
      .filter((message) => message.id !== messageId)
      .map((message) =>
        message.replyTo?.id === messageId ? { ...message, replyTo: null } : message,
      ),
  );
}

export function replaceMessageInWindows(conversationId: string | undefined, next: Message) {
  updateWindows(conversationId, (messages) =>
    messages.map((message) => (message.id === next.id ? next : message)),
  );
}

/**
 * Reconciles a confirmed live message into the server-backed latest window.
 *
 * The thread renders from Zustand while it is open, but it is rebuilt from this query after
 * navigation. Keeping the acknowledgement only in Zustand therefore makes a sent message vanish
 * until the query is fetched again. Anchored historical windows are intentionally left alone: a
 * newly delivered message does not belong in a window centred on an older message.
 */
export function upsertMessageInLatestWindow(conversationId: string | undefined, next: Message) {
  if (!conversationId) return;

  queryClient.setQueryData<ConversationWindows>(
    chatQueryKeys.conversationWindow(conversationId, null),
    (windows) => {
      if (!windows?.pages.length) return windows;

      let found = false;
      const pages = windows.pages.map((page) => ({
        ...page,
        conversation: {
          ...page.conversation,
          messages: page.conversation.messages.map((message) => {
            const matches =
              message.id === next.id ||
              Boolean(next.clientMessageId && message.clientMessageId === next.clientMessageId);
            if (!matches) return message;

            found = true;
            return next;
          }),
        },
      }));

      if (!found) {
        pages[0] = {
          ...pages[0],
          conversation: {
            ...pages[0].conversation,
            messages: [...pages[0].conversation.messages, next],
          },
        };
      }

      return { ...windows, pages };
    },
  );
}

function markDeletedParticipant<T extends Conversation>(conversation: T, userId: string) {
  return {
    ...conversation,
    isReadOnly: true,
    participants: conversation.participants.map((participant) =>
      participant.id === userId
        ? {
            ...participant,
            displayName: 'Deleted user',
            avatarUrl: null,
            country: null,
            isDeleted: true,
          }
        : participant,
    ),
  };
}

export function markParticipantDeletedInCaches(conversationId: string, userId: string) {
  queryClient.setQueryData<ConversationsResponse>(chatQueryKeys.conversations(), (data) =>
    data
      ? {
          conversations: data.conversations.map((conversation) =>
            conversation.id === conversationId
              ? markDeletedParticipant(conversation, userId)
              : conversation,
          ),
        }
      : data,
  );

  queryClient.setQueriesData<ConversationWindows>(
    { queryKey: chatQueryKeys.conversation(conversationId) },
    (windows) =>
      windows
        ? {
            ...windows,
            pages: windows.pages.map((page) => ({
              ...page,
              conversation: markDeletedParticipant(page.conversation, userId),
            })),
          }
        : windows,
  );
}
