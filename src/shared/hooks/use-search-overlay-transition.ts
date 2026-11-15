import { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, Platform, useWindowDimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  Easing,
  Extrapolation,
  interpolate,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

export type SearchBarRect = { x: number; y: number; width: number; height: number };

export const SEARCH_BAR_HEIGHT = 50;
const HORIZONTAL_GUTTER = 16;
const CANCEL_SLOT_WIDTH = 84;

// A gentle ease-in-out so the bar accelerates softly, glides, and settles without a snap.
const OPEN_TIMING = {
  duration: 520,
  easing: Easing.bezier(0.32, 0.72, 0, 1),
  reduceMotion: ReduceMotion.System,
};
const CLOSE_TIMING = {
  duration: 420,
  easing: Easing.bezier(0.32, 0.72, 0, 1),
  reduceMotion: ReduceMotion.System,
};
// Resting style for layers that fade/slide in; applied once the transition has settled.
const SETTLED_VISIBLE = { opacity: 1 };
// Swipe-to-dismiss (iOS): how far (share of screen width) or how fast the finger must travel.
const DISMISS_DISTANCE_RATIO = 0.33;
const DISMISS_VELOCITY = 650;

/**
 * Drives a full-screen search layer that sits above the tabs. The bar is laid out at its final
 * position and translated from the trigger's measured rect, so it rises out of the page's search field
 * while the backdrop fades in over the live page underneath. `close` plays the exact reverse and only
 * then calls `onClosed`, so the layer never disappears mid-animation. On iOS a rightward swipe
 * slides the search away, revealing the page underneath like the system back gesture.
 */
export function useSearchOverlayTransition(
  origin: SearchBarRect | null,
  onClosed: () => void,
  onOpened?: () => void,
) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const progress = useSharedValue(0);
  const dragX = useSharedValue(0);
  /**
   * Animated styles are attached only while the layer moves. At rest it renders plain, fully
   * visible styles, so when iOS detaches and re-attaches the tabs (opening a chat from a result
   * and coming back) the rebuilt native views come from React props instead of the first frame's
   * animated values (opacity 0), which left an invisible layer blocking every touch.
   */
  const [isMoving, setIsMoving] = useState(true);
  const settle = useCallback(() => setIsMoving(false), []);
  const startMoving = useCallback(() => setIsMoving(true), []);

  const target: SearchBarRect = {
    x: HORIZONTAL_GUTTER,
    y: insets.top + 8,
    width: windowWidth - HORIZONTAL_GUTTER * 2 - CANCEL_SLOT_WIDTH,
    height: SEARCH_BAR_HEIGHT,
  };
  const start = origin ?? { ...target, y: target.y + 24 };
  const offsetX = start.x - target.x;
  const offsetY = start.y - target.y;

  useEffect(() => {
    progress.set(
      withTiming(1, OPEN_TIMING, (finished) => {
        if (!finished) return;
        scheduleOnRN(settle);
        // Opening the keyboard mid-flight competes with the transition, so wait for the bar.
        if (onOpened) scheduleOnRN(onOpened);
      }),
    );
    // Runs once on mount; `onOpened` is only needed for the first open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const close = useCallback(() => {
    setIsMoving(true);
    // Let React re-attach the animated styles (still at their resting values) before moving.
    requestAnimationFrame(() => {
      progress.set(
        withTiming(0, CLOSE_TIMING, (finished) => {
          if (finished) scheduleOnRN(onClosed);
        }),
      );
    });
  }, [onClosed, progress]);

  // Worklets may only call back into JS through plain functions. Referencing `Keyboard.dismiss`
  // inside the gesture would capture the whole native Keyboard module and crash on mount.
  const dismissKeyboard = useCallback(() => Keyboard.dismiss(), []);

  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(Platform.OS === 'ios')
        // Only rightward horizontal drags; vertical movement keeps scrolling the results.
        .activeOffsetX(14)
        .failOffsetX(-14)
        .failOffsetY([-14, 14])
        .onStart(() => {
          scheduleOnRN(startMoving);
          scheduleOnRN(dismissKeyboard);
        })
        .onUpdate((event) => {
          dragX.set(Math.max(0, event.translationX));
        })
        .onEnd((event) => {
          const shouldDismiss =
            event.translationX > windowWidth * DISMISS_DISTANCE_RATIO ||
            event.velocityX > DISMISS_VELOCITY;
          if (shouldDismiss) {
            dragX.set(
              withSpring(
                windowWidth,
                {
                  velocity: event.velocityX,
                  dampingRatio: 1,
                  duration: 320,
                  overshootClamping: true,
                  reduceMotion: ReduceMotion.System,
                },
                (finished) => {
                  if (finished) scheduleOnRN(onClosed);
                },
              ),
            );
            return;
          }
          dragX.set(
            withSpring(
              0,
              {
                velocity: event.velocityX,
                dampingRatio: 0.9,
                duration: 320,
                reduceMotion: ReduceMotion.System,
              },
              (finished) => {
                if (finished) scheduleOnRN(settle);
              },
            ),
          );
        }),
    [dismissKeyboard, dragX, onClosed, settle, startMoving, windowWidth],
  );

  const barStyle = useAnimatedStyle(() => {
    const value = progress.get();
    return {
      width: interpolate(value, [0, 1], [start.width, target.width]),
      transform: [
        { translateX: interpolate(value, [0, 1], [offsetX, 0]) + dragX.get() },
        { translateY: interpolate(value, [0, 1], [offsetY, 0]) },
      ],
    };
  });
  const backdropStyle = useAnimatedStyle(() => {
    const fade = interpolate(progress.get(), [0, 0.6], [0, 1], Extrapolation.CLAMP);
    const drag = interpolate(dragX.get(), [0, windowWidth], [1, 0], Extrapolation.CLAMP);
    return { opacity: fade * drag };
  });
  const cancelStyle = useAnimatedStyle(() => {
    const value = progress.get();
    return {
      opacity: interpolate(value, [0.5, 1], [0, 1], Extrapolation.CLAMP),
      transform: [{ translateX: interpolate(value, [0, 1], [28, 0]) + dragX.get() }],
    };
  });
  const contentStyle = useAnimatedStyle(() => {
    const value = progress.get();
    return {
      opacity: interpolate(value, [0.55, 1], [0, 1], Extrapolation.CLAMP),
      transform: [{ translateX: dragX.get() }, { translateY: interpolate(value, [0, 1], [22, 0]) }],
    };
  });

  return {
    backdropStyle: isMoving ? backdropStyle : SETTLED_VISIBLE,
    barLeft: target.x,
    barStyle: isMoving ? barStyle : { width: target.width },
    barTop: target.y,
    cancelLeft: target.x + target.width,
    cancelStyle: isMoving ? cancelStyle : SETTLED_VISIBLE,
    cancelWidth: CANCEL_SLOT_WIDTH + HORIZONTAL_GUTTER,
    close,
    contentStyle: isMoving ? contentStyle : SETTLED_VISIBLE,
    contentTop: target.y + SEARCH_BAR_HEIGHT + 14,
    swipeGesture,
  };
}
