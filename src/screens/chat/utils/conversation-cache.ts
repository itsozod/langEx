import type { InfiniteData } from '@tanstack/react-query';

import { queryClient } from '@/providers/query-provider';

import type { ConversationWindowParams } from '../api';
import { chatQueryKeys } from '../hooks';
import type { ConversationResponse, Message } from '../types';

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
