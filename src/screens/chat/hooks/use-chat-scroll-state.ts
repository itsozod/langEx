import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

const AT_LATEST_DISTANCE = 80;
const SCROLLED_AWAY_DISTANCE = 420;

type UseChatScrollStateOptions = {
  clearUnseenMessages: () => void;
  hasNewerMessages: boolean;
  isFetchingNewerMessages: boolean;
  isHistoricalWindow: boolean;
  latestDistanceRef: RefObject<number>;
  onReachLatest: () => void;
};

/** Owns UI state derived from a chronological list's distance from its bottom edge. */
export function useChatScrollState({
  clearUnseenMessages,
  hasNewerMessages,
  isFetchingNewerMessages,
  isHistoricalWindow,
  latestDistanceRef,
  onReachLatest,
}: UseChatScrollStateOptions) {
  const hasUserDraggedRef = useRef(false);
  const promotedToLatestRef = useRef(false);
  const wasScrolledAwayRef = useRef(false);
  const wasAtLatestRef = useRef(true);
  const [isScrolledAway, setIsScrolledAway] = useState(false);

  const promoteHistoricalWindow = useCallback(() => {
    if (
      !isHistoricalWindow ||
      !hasUserDraggedRef.current ||
      promotedToLatestRef.current ||
      hasNewerMessages ||
      isFetchingNewerMessages ||
      latestDistanceRef.current >= AT_LATEST_DISTANCE
    )
      return;

    promotedToLatestRef.current = true;
    wasScrolledAwayRef.current = false;
    wasAtLatestRef.current = true;
    latestDistanceRef.current = 0;
    setIsScrolledAway(false);
    onReachLatest();
  }, [
    hasNewerMessages,
    isFetchingNewerMessages,
    isHistoricalWindow,
    latestDistanceRef,
    onReachLatest,
  ]);

  useEffect(() => {
    if (!isHistoricalWindow) {
      hasUserDraggedRef.current = false;
      promotedToLatestRef.current = false;
      return;
    }
    if (hasNewerMessages) promotedToLatestRef.current = false;
    promoteHistoricalWindow();
  }, [hasNewerMessages, isHistoricalWindow, promoteHistoricalWindow]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const offset = Math.max(0, contentOffset.y);
      const distanceFromLatest = Math.max(
        0,
        contentSize.height - layoutMeasurement.height - offset,
      );
      latestDistanceRef.current = distanceFromLatest;

      const hasScrolledAway = distanceFromLatest > SCROLLED_AWAY_DISTANCE;
      if (hasScrolledAway !== wasScrolledAwayRef.current) {
        wasScrolledAwayRef.current = hasScrolledAway;
        setIsScrolledAway(hasScrolledAway);
      }

      const isAtLatest = !isHistoricalWindow && distanceFromLatest < AT_LATEST_DISTANCE;
      if (isAtLatest && !wasAtLatestRef.current) clearUnseenMessages();
      wasAtLatestRef.current = isAtLatest;
      promoteHistoricalWindow();
    },
    [clearUnseenMessages, isHistoricalWindow, latestDistanceRef, promoteHistoricalWindow],
  );

  const handleScrollBeginDrag = useCallback(() => {
    if (isHistoricalWindow) hasUserDraggedRef.current = true;
  }, [isHistoricalWindow]);

  const resetManualScroll = useCallback(() => {
    hasUserDraggedRef.current = false;
    promotedToLatestRef.current = false;
  }, []);

  return { handleScroll, handleScrollBeginDrag, isScrolledAway, resetManualScroll };
}
