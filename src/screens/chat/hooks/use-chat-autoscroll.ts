import type { FlashListProps, FlashListRef } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import type { GiftedMessage } from '../types/message.types';

const SCROLL_ATTEMPT_DELAYS_MS = [0, 80, 220];
const WINDOW_SWAP_DELAYS_MS = [0, 120, 320];

export function useChatAutoscroll(isHistoricalWindow: boolean) {
  const listRef = useRef<FlashListRef<GiftedMessage> | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const scrollToLatest = useCallback((animated = true) => {
    listRef.current?.scrollToEnd({ animated });
  }, []);

  const scrollToLatestWindow = useCallback(() => {
    clearTimers();
    for (const delay of WINDOW_SWAP_DELAYS_MS)
      timersRef.current.push(setTimeout(() => scrollToLatest(false), delay));
  }, [clearTimers, scrollToLatest]);

  const scrollToLatestAfterSend = useCallback(() => {
    clearTimers();
    for (const delay of SCROLL_ATTEMPT_DELAYS_MS)
      timersRef.current.push(setTimeout(() => scrollToLatest(), delay));
  }, [clearTimers, scrollToLatest]);

  const maintainVisibleContentPosition = useMemo<
    NonNullable<FlashListProps<GiftedMessage>['maintainVisibleContentPosition']>
  >(
    () => ({
      startRenderingFromBottom: true,
      // Live messages follow only when the reader is already near the bottom. Historical windows
      // never auto-scroll: both pagination directions preserve the row currently under the finger.
      ...(isHistoricalWindow
        ? {}
        : { autoscrollToBottomThreshold: 0.12, animateAutoScrollToBottom: true }),
    }),
    [isHistoricalWindow],
  );

  return {
    listRef,
    maintainVisibleContentPosition,
    scrollToLatestAfterSend,
    scrollToLatestWindow,
  };
}
