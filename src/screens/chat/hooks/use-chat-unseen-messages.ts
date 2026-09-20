import type { RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { useChatStore } from '@/shared/store/chat-store';

const AT_LATEST_OFFSET = 80;

type UseChatUnseenMessagesOptions = {
  conversationId?: string;
  currentUserId?: string;
  isHistoricalWindow: boolean;
  latestDistanceRef: RefObject<number>;
};

export function useChatUnseenMessages({
  conversationId,
  currentUserId,
  isHistoricalWindow,
  latestDistanceRef,
}: UseChatUnseenMessagesOptions) {
  const [unseenMessageCount, setUnseenMessageCount] = useState(0);
  const clearUnseenMessages = useCallback(() => setUnseenMessageCount(0), []);

  useEffect(
    () =>
      useChatStore.subscribe((state, previousState) => {
        if (!conversationId) return;
        const latestMessage = state.conversations.find(
          (conversation) => conversation.id === conversationId,
        )?.lastMessage;
        const previousMessage = previousState.conversations.find(
          (conversation) => conversation.id === conversationId,
        )?.lastMessage;
        if (!latestMessage || latestMessage.id === previousMessage?.id) return;
        const isIncoming = latestMessage.senderId !== currentUserId;
        const isAwayFromLatest = isHistoricalWindow || latestDistanceRef.current > AT_LATEST_OFFSET;
        if (isIncoming && isAwayFromLatest) setUnseenMessageCount((count) => count + 1);
      }),
    [conversationId, currentUserId, isHistoricalWindow, latestDistanceRef],
  );

  return { clearUnseenMessages, unseenMessageCount };
}
