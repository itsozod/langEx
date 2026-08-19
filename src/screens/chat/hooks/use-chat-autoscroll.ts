import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, type FlatList, type FlatListProps } from 'react-native';
import type { GiftedChat } from 'react-native-gifted-chat';

import type { GiftedMessage } from '../types';

type MessagesContainerRef = Parameters<typeof GiftedChat<GiftedMessage>>[0]['messagesContainerRef'];

/**
 * Keeps the reading position stable while older pages load and while the other participant sends
 * messages. Index 0 is the newest message because the Gifted Chat list is inverted.
 */
const KEEP_READING_POSITION: FlatListProps<GiftedMessage>['maintainVisibleContentPosition'] = {
  minIndexForVisible: 0,
};

/**
 * Android's `MaintainVisibleScrollPositionHelper` re-anchors the list from `didMountItems`, after
 * the sent row mounts, with a hard `scrollTo` plus `recreateFlingAnimation`, and that call cancels
 * the running fling animator that drives `scrollToOffset({ animated: true })`. So Gifted Chat's
 * own scroll-to-bottom on send is killed mid-flight and the thread stays in the history.
 *
 * iOS applies the same adjustment inside the mount transaction (`mountingTransactionDidMount`),
 * before the delayed scroll command runs, so the scroll survives there and needs no help.
 *
 * The anchor is therefore suspended around a local send on Android only. Suspending it on iOS
 * causes the opposite bug: iOS keeps one component view per scroll view, so the transaction that
 * re-enables the prop skips `_prepareForMaintainVisibleScrollPosition` yet still runs the
 * adjustment against the frame captured before the sent row existed, scrolling the thread back
 * down by exactly that row's height. Android rebuilds the helper from scratch on re-enable, so it
 * has no stale anchor to correct against.
 */
const IS_ANCHOR_SUSPENDABLE = Platform.OS === 'android';
const ANCHOR_SUSPEND_MS = 600;
// Repeats cover rows that mount later: layout of the sent bubble, then the server echo.
const SCROLL_ATTEMPT_DELAYS_MS = [0, 80, 220, 420];
// A window swap replaces the whole list a render later, so the snap has to outlive that render.
const WINDOW_SWAP_DELAYS_MS = [0, 120, 320];

export function useChatAutoscroll() {
  const listRef = useRef<FlatList<GiftedMessage> | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [isReadingPositionAnchored, setIsReadingPositionAnchored] = useState(true);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const scrollToLatest = useCallback((animated = true) => {
    // Offset 0 is the newest message in an inverted list, so this is exact before layout settles.
    listRef.current?.scrollToOffset({ offset: 0, animated });
  }, []);

  /** Snaps to the newest message after the thread swaps back to the latest window. */
  const scrollToLatestWindow = useCallback(() => {
    clearTimers();
    for (const delay of WINDOW_SWAP_DELAYS_MS)
      timersRef.current.push(setTimeout(() => scrollToLatest(false), delay));
  }, [clearTimers, scrollToLatest]);

  const scrollToLatestAfterSend = useCallback(() => {
    if (!IS_ANCHOR_SUSPENDABLE) return;

    clearTimers();
    setIsReadingPositionAnchored(false);

    for (const delay of SCROLL_ATTEMPT_DELAYS_MS)
      timersRef.current.push(setTimeout(() => scrollToLatest(), delay));

    timersRef.current.push(setTimeout(() => setIsReadingPositionAnchored(true), ANCHOR_SUSPEND_MS));
  }, [clearTimers, scrollToLatest]);

  // Gifted Chat types the ref as a non-nullable ref to the gesture-handler `FlatList` component
  // type, so the accurate React Native list ref needs a cast at that boundary.
  const messagesContainerRef = useMemo(() => listRef as MessagesContainerRef, []);

  return {
    listRef,
    maintainVisibleContentPosition: isReadingPositionAnchored ? KEEP_READING_POSITION : undefined,
    messagesContainerRef,
    scrollToLatestAfterSend,
    scrollToLatestWindow,
  };
}
