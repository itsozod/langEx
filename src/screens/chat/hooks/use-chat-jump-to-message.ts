import type { FlashListRef } from '@shopify/flash-list';
import type { RefObject } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import type { GiftedMessage } from '../types/message.types';

const HIGHLIGHT_MS = 1400;
const REVEAL_SETTLE_MS = 900;
const GIVE_UP_MS = 8000;
const LAYOUT_SETTLE_MS = 80;
const CENTER_TOLERANCE_PX = 1.5;
const MAX_CENTER_ATTEMPTS = 3;

type RevealAttempt = { id: number; messageId: string };

type UseChatJumpToMessageOptions = {
  listRef: RefObject<FlashListRef<GiftedMessage> | null>;
  messages: GiftedMessage[];
  onRequestMessageWindow: (messageId: string) => void;
};

function indexOfMessage(messages: GiftedMessage[], messageId: string) {
  return messages.findIndex((message) => String(message._id) === messageId);
}

function getCenteringError(list: FlashListRef<GiftedMessage>, index: number) {
  try {
    const layout = list.getLayout(index);
    if (!layout) return Number.POSITIVE_INFINITY;

    const windowHeight = list.getWindowSize().height;
    const contentHeight = list.getChildContainerDimensions().height;
    const firstItemOffset = list.getFirstItemOffset();
    const maxOffset = Math.max(0, contentHeight - windowHeight + firstItemOffset);
    const desiredOffset = Math.min(
      maxOffset,
      Math.max(0, layout.y - (windowHeight - layout.height) / 2 + firstItemOffset),
    );
    return Math.abs(desiredOffset - list.getAbsoluteLastScrollOffset());
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

/** Reveals a loaded reply target or swaps to a server window centred on an unloaded target. */
export function useChatJumpToMessage({
  listRef,
  messages,
  onRequestMessageWindow,
}: UseChatJumpToMessageOptions) {
  const highlightedMessageId = useSharedValue<string | null>(null);
  const attemptSequenceRef = useRef(0);
  const pendingRevealRef = useRef<RevealAttempt | null>(null);
  const revealingRef = useRef<RevealAttempt | null>(null);
  const highlightAttemptRef = useRef<number | null>(null);
  const messagesRef = useRef(messages);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);
  useLayoutEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const waitForLayout = useCallback(
    () =>
      new Promise<void>((resolve) => {
        timersRef.current.push(setTimeout(resolve, LAYOUT_SETTLE_MS));
      }),
    [],
  );

  const completeReveal = useCallback(
    (attempt: RevealAttempt) => {
      if (revealingRef.current?.id !== attempt.id) return;
      highlightAttemptRef.current = attempt.id;
      highlightedMessageId.set(attempt.messageId);
      timersRef.current.push(
        setTimeout(() => {
          if (revealingRef.current?.id !== attempt.id) return;
          revealingRef.current = null;
        }, REVEAL_SETTLE_MS),
        setTimeout(() => {
          if (highlightAttemptRef.current !== attempt.id) return;
          highlightAttemptRef.current = null;
          highlightedMessageId.set(null);
        }, HIGHLIGHT_MS),
      );
    },
    [highlightedMessageId],
  );

  const reveal = useCallback(
    (attempt: RevealAttempt) => {
      if (!listRef.current) return;
      revealingRef.current = attempt;

      void (async () => {
        for (let centerAttempt = 0; centerAttempt < MAX_CENTER_ATTEMPTS; centerAttempt += 1) {
          if (revealingRef.current?.id !== attempt.id) return;
          const list = listRef.current;
          const index = indexOfMessage(messagesRef.current, attempt.messageId);
          if (!list || index < 0) return;

          // FlashList's promise resolves on a fixed post-command delay. A newly swapped window can
          // still commit corrected variable-height rows immediately afterwards, so verify against
          // FlashList's own layout map and converge with a non-animated correction when needed.
          await list.scrollToIndex({
            index,
            animated: centerAttempt === 0,
            viewPosition: 0.5,
          });
          await waitForLayout();
          if (revealingRef.current?.id !== attempt.id) return;

          const currentList = listRef.current;
          const currentIndex = indexOfMessage(messagesRef.current, attempt.messageId);
          if (
            currentList &&
            currentIndex >= 0 &&
            getCenteringError(currentList, currentIndex) <= CENTER_TOLERANCE_PX
          ) {
            // Require the centred position to survive one more layout interval before highlighting.
            await waitForLayout();
            const stableList = listRef.current;
            const stableIndex = indexOfMessage(messagesRef.current, attempt.messageId);
            if (
              revealingRef.current?.id === attempt.id &&
              stableList &&
              stableIndex >= 0 &&
              getCenteringError(stableList, stableIndex) <= CENTER_TOLERANCE_PX
            )
              break;
          }
        }

        completeReveal(attempt);
      })();
    },
    [completeReveal, listRef, waitForLayout],
  );

  const jumpToMessage = useCallback(
    (messageId: string) => {
      const attempt = { id: ++attemptSequenceRef.current, messageId };
      timersRef.current.push(
        setTimeout(() => {
          const stillPending = pendingRevealRef.current?.id === attempt.id;
          const stillRevealing = revealingRef.current?.id === attempt.id;
          if (!stillPending && !stillRevealing) return;
          if (stillPending) pendingRevealRef.current = null;
          if (stillRevealing) revealingRef.current = null;
        }, GIVE_UP_MS),
      );

      const index = indexOfMessage(messages, messageId);
      if (index >= 0) {
        pendingRevealRef.current = null;
        reveal(attempt);
        return;
      }

      pendingRevealRef.current = attempt;
      onRequestMessageWindow(messageId);
    },
    [messages, onRequestMessageWindow, reveal],
  );

  useEffect(() => {
    const attempt = pendingRevealRef.current;
    if (!attempt) return;
    const index = indexOfMessage(messages, attempt.messageId);
    if (index < 0 || pendingRevealRef.current?.id !== attempt.id) return;
    pendingRevealRef.current = null;
    reveal(attempt);
  }, [messages, reveal]);

  const cancelReveal = useCallback(() => {
    pendingRevealRef.current = null;
    revealingRef.current = null;
  }, []);

  return {
    cancelReveal,
    highlightedMessageId,
    jumpToMessage,
    onScrollBeginDrag: cancelReveal,
  };
}
