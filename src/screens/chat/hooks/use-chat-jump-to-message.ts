import type { RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { findNodeHandle, UIManager } from 'react-native';
import type { FlatList, LayoutChangeEvent } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import type { GiftedMessage } from '../types/message.types';

const HIGHLIGHT_MS = 1400;
const SCROLL_RETRY_MS = 240;
const SCROLL_END_FALLBACK_MS = 500;
/** How long a reveal owns the scroll position, so nothing else moves the list mid-jump. */
const REVEAL_SETTLE_MS = 900;
/** Abandons a jump whose target never shows up, so a stale target cannot be revealed later. */
const GIVE_UP_MS = 8000;

type ScrollToIndexFailure = {
  averageItemLength: number;
  highestMeasuredFrameIndex: number;
  index: number;
};

type UseChatJumpToMessageOptions = {
  listRef: RefObject<FlatList<GiftedMessage> | null>;
  messages: GiftedMessage[];
  onRevealSettled: () => void;
  onRevealStart: () => void;
  onRequestMessageWindow: (messageId: string) => void;
  scrollOffsetRef: RefObject<number>;
};

function indexOfMessage(messages: GiftedMessage[], messageId: string) {
  return messages.findIndex((message) => String(message._id) === messageId);
}

/**
 * Tapping the quote inside a reply bubble reveals the message it answers, the way Instagram does.
 * When the original is outside the loaded window, the thread swaps to the window centred on it and
 * the jump completes as soon as that window renders, however far back the message is.
 *
 * The pending target and the highlight are deliberately kept out of React state: resolving a jump
 * is a side effect on the list and the pagination query, not rendered state, and the flash is a
 * transient animation that should never re-render the thread.
 */
export function useChatJumpToMessage({
  listRef,
  messages,
  onRevealSettled,
  onRevealStart,
  onRequestMessageWindow,
  scrollOffsetRef,
}: UseChatJumpToMessageOptions) {
  const highlightedMessageId = useSharedValue<string | null>(null);
  const pendingMessageIdRef = useRef<string | null>(null);
  const revealingMessageIdRef = useRef<string | null>(null);
  const awaitingHighlightMessageIdRef = useRef<string | null>(null);
  const scrollAttemptFailedRef = useRef(false);
  const messageViewsRef = useRef(new Map<string, LayoutChangeEvent['currentTarget']>());
  const messagesRef = useRef(messages);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  // Deferred scroll retries must resolve against the list as it is then, not as it was when the
  // retry was scheduled: loading a page in either direction renumbers every row.
  useEffect(() => {
    messagesRef.current = messages;
    const messageIds = new Set(messages.map((message) => String(message._id)));
    for (const messageId of messageViewsRef.current.keys())
      if (!messageIds.has(messageId)) messageViewsRef.current.delete(messageId);
  }, [messages]);

  const onMessageLayout = useCallback((messageId: string, event: LayoutChangeEvent) => {
    messageViewsRef.current.set(messageId, event.currentTarget);
  }, []);

  const completeReveal = useCallback(
    (messageId: string) => {
      if (awaitingHighlightMessageIdRef.current === messageId)
        awaitingHighlightMessageIdRef.current = null;
      highlightedMessageId.set(messageId);
      timersRef.current.push(
        setTimeout(() => {
          if (revealingMessageIdRef.current !== messageId) return;
          revealingMessageIdRef.current = null;
          onRevealSettled();
        }, REVEAL_SETTLE_MS),
        setTimeout(() => {
          if (highlightedMessageId.get() === messageId) highlightedMessageId.set(null);
        }, HIGHLIGHT_MS),
      );
    },
    [highlightedMessageId, onRevealSettled],
  );

  const completeScrolledReveal = useCallback(() => {
    const messageId = awaitingHighlightMessageIdRef.current;
    if (!messageId) return;

    const messageView = messageViewsRef.current.get(messageId);
    const scrollView = listRef.current?.getNativeScrollRef();
    const scrollViewTag = scrollView ? findNodeHandle(scrollView) : null;
    if (!messageView || scrollViewTag === null) return;

    messageView.measureInWindow((_messageX, messageY, _messageWidth, messageHeight) => {
      UIManager.measureInWindow(scrollViewTag, (_listX, listY, _listWidth, listHeight) => {
        if (awaitingHighlightMessageIdRef.current !== messageId) return;

        const messageCenter = messageY + messageHeight / 2;
        const viewportCenter = listY + listHeight / 2;
        const remainingDelta = messageCenter - viewportCenter;
        if (Math.abs(remainingDelta) > 1) {
          listRef.current?.scrollToOffset({
            animated: false,
            offset: Math.max(0, scrollOffsetRef.current - remainingDelta),
          });
        }
        completeReveal(messageId);
      });
    });
  }, [completeReveal, listRef, scrollOffsetRef]);

  const scrollToMessage = useCallback(
    (index: number, messageId?: string) => {
      const list = listRef.current;
      if (!list) return;

      // `onScrollToIndexFailed` fires synchronously. Only start the highlight when FlatList has
      // accepted the exact centred scroll, not while it is still estimating an unmeasured row.
      scrollAttemptFailedRef.current = false;
      list.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      if (!scrollAttemptFailedRef.current && messageId) {
        awaitingHighlightMessageIdRef.current = messageId;
        // `onMomentumScrollEnd` is the normal completion signal. Keep a fallback for an already
        // centred row, where iOS accepts the command but has no momentum event to emit.
        timersRef.current.push(
          setTimeout(() => {
            if (awaitingHighlightMessageIdRef.current === messageId) completeScrolledReveal();
          }, SCROLL_END_FALLBACK_MS),
        );
      }
    },
    [completeScrolledReveal, listRef],
  );

  const reveal = useCallback(
    (index: number, messageId: string) => {
      revealingMessageIdRef.current = messageId;
      scrollToMessage(index, messageId);
    },
    [scrollToMessage],
  );

  const jumpToMessage = useCallback(
    (messageId: string) => {
      onRevealStart();
      timersRef.current.push(
        setTimeout(() => {
          const stillPending = pendingMessageIdRef.current === messageId;
          const stillRevealing = revealingMessageIdRef.current === messageId;
          if (!stillPending && !stillRevealing) return;

          if (stillPending) pendingMessageIdRef.current = null;
          if (stillRevealing) revealingMessageIdRef.current = null;
          if (awaitingHighlightMessageIdRef.current === messageId)
            awaitingHighlightMessageIdRef.current = null;
          onRevealSettled();
        }, GIVE_UP_MS),
      );

      const index = indexOfMessage(messages, messageId);
      if (index >= 0) {
        pendingMessageIdRef.current = null;
        reveal(index, messageId);
        return;
      }

      pendingMessageIdRef.current = messageId;
      onRequestMessageWindow(messageId);
    },
    [messages, onRequestMessageWindow, onRevealSettled, onRevealStart, reveal],
  );

  // The requested window reaches this list a render after it reaches the query, so the jump is
  // completed here rather than at the call site.
  useEffect(() => {
    const pendingMessageId = pendingMessageIdRef.current;
    if (!pendingMessageId) return;

    const index = indexOfMessage(messages, pendingMessageId);
    if (index < 0) return;

    pendingMessageIdRef.current = null;
    reveal(index, pendingMessageId);
  }, [messages, reveal]);

  // Rows far outside the render window have no measured layout yet, so approximate first and land
  // on the row once it has been rendered.
  const handleScrollToIndexFailed = useCallback(
    (info: ScrollToIndexFailure) => {
      scrollAttemptFailedRef.current = true;
      // Move into the target's render neighbourhood without animation. Animating both this
      // estimate and the exact retry made iOS visibly continue past an already-highlighted row.
      listRef.current?.scrollToOffset({
        offset: info.averageItemLength * info.index,
        animated: false,
      });

      timersRef.current.push(
        setTimeout(() => {
          const messageId = revealingMessageIdRef.current;
          const index = messageId
            ? indexOfMessage(messagesRef.current, messageId)
            : Math.min(info.index, messagesRef.current.length - 1);
          if (index < 0) return;
          scrollToMessage(index, messageId ?? undefined);
        }, SCROLL_RETRY_MS),
      );
    },
    [listRef, scrollToMessage],
  );

  const interruptReveal = useCallback(() => {
    const hasActiveReveal =
      pendingMessageIdRef.current !== null || revealingMessageIdRef.current !== null;
    if (!hasActiveReveal) return;

    pendingMessageIdRef.current = null;
    revealingMessageIdRef.current = null;
    awaitingHighlightMessageIdRef.current = null;
    onRevealSettled();
  }, [onRevealSettled]);

  /** True while a jump is being resolved, so scroll-driven paging can stay out of its way. */
  const isRevealPending = useCallback(
    () => pendingMessageIdRef.current !== null || revealingMessageIdRef.current !== null,
    [],
  );

  return {
    highlightedMessageId,
    isRevealPending,
    jumpToMessage,
    onMessageLayout,
    onScrollBeginDrag: interruptReveal,
    onScrollEnd: completeScrolledReveal,
    onScrollFailed: handleScrollToIndexFailed,
  };
}
