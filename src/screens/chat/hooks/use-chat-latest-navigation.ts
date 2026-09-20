import type { RefObject } from 'react';
import { useCallback } from 'react';
import type { FlashListRef } from '@shopify/flash-list';

import type { GiftedMessage } from '../types/message.types';

type UseChatLatestNavigationOptions = {
  cancelReveal: () => void;
  clearUnseenMessages: () => void;
  isHistoricalWindow: boolean;
  listRef: RefObject<FlashListRef<GiftedMessage> | null>;
  onJumpToLatest: () => void;
  scrollToLatestWindow: () => void;
};

export function useChatLatestNavigation({
  cancelReveal,
  clearUnseenMessages,
  isHistoricalWindow,
  listRef,
  onJumpToLatest,
  scrollToLatestWindow,
}: UseChatLatestNavigationOptions) {
  return useCallback(() => {
    clearUnseenMessages();
    if (!isHistoricalWindow) {
      listRef.current?.scrollToEnd({ animated: true });
      return;
    }
    cancelReveal();
    onJumpToLatest();
    scrollToLatestWindow();
  }, [
    cancelReveal,
    clearUnseenMessages,
    isHistoricalWindow,
    listRef,
    onJumpToLatest,
    scrollToLatestWindow,
  ]);
}
