import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { FlatList } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import type { GiftedMessage } from '../types';

const HIGHLIGHT_MS = 1400;
const SCROLL_RETRY_MS = 240;
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
  onRequestMessageWindow: (messageId: string) => void;
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
  onRequestMessageWindow,
}: UseChatJumpToMessageOptions) {
  const highlightedMessageId = useSharedValue<string | null>(null);
  const pendingMessageIdRef = useRef<string | null>(null);
  const revealingMessageIdRef = useRef<string | null>(null);
  const messagesRef = useRef(messages);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  // Deferred scroll retries must resolve against the list as it is then, not as it was when the
  // retry was scheduled: loading a page in either direction renumbers every row.
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const reveal = useCallback(
    (index: number, messageId: string) => {
      revealingMessageIdRef.current = messageId;
      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      highlightedMessageId.value = messageId;

      timersRef.current.push(
        setTimeout(() => {
          if (revealingMessageIdRef.current === messageId) revealingMessageIdRef.current = null;
        }, REVEAL_SETTLE_MS),
        setTimeout(() => {
          if (highlightedMessageId.value === messageId) highlightedMessageId.value = null;
        }, HIGHLIGHT_MS),
      );
    },
    // `highlightedMessageId` is a shared value and is stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listRef],
  );

  const jumpToMessage = useCallback(
    (messageId: string) => {
      const index = indexOfMessage(messages, messageId);
      if (index >= 0) {
        pendingMessageIdRef.current = null;
        reveal(index, messageId);
        return;
      }

      pendingMessageIdRef.current = messageId;
      onRequestMessageWindow(messageId);

      timersRef.current.push(
        setTimeout(() => {
          if (pendingMessageIdRef.current === messageId) pendingMessageIdRef.current = null;
        }, GIVE_UP_MS),
      );
    },
    [messages, onRequestMessageWindow, reveal],
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
      listRef.current?.scrollToOffset({
        offset: info.averageItemLength * info.index,
        animated: true,
      });

      timersRef.current.push(
        setTimeout(() => {
          const messageId = revealingMessageIdRef.current;
          const index = messageId
            ? indexOfMessage(messagesRef.current, messageId)
            : Math.min(info.index, messagesRef.current.length - 1);
          if (index < 0) return;
          listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        }, SCROLL_RETRY_MS),
      );
    },
    [listRef],
  );

  /** True while a jump is being resolved, so scroll-driven paging can stay out of its way. */
  const isRevealPending = useCallback(
    () => pendingMessageIdRef.current !== null || revealingMessageIdRef.current !== null,
    [],
  );

  return { handleScrollToIndexFailed, highlightedMessageId, isRevealPending, jumpToMessage };
}
