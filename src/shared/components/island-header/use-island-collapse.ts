import { type RefObject, useCallback, useRef, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import {
  clamp,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

/** Height of the compact title bar below the status bar. */
export const COLLAPSED_BAR_HEIGHT = 44;
/** Dynamic Island geometry (iPhone 14 Pro and later, in points). */
const ISLAND_TOP = 11;
export const ISLAND_HEIGHT = 37;
export const ISLAND_WIDTH = 126;
/** Phones with a Dynamic Island report a top safe area of 59pt or more; notched phones ≤ 50. */
const ISLAND_MIN_TOP_INSET = 54;
/** Progress at which the compact bar takes over (buttons become tappable, title shows). */
const COLLAPSED_AT = 0.75;

export type IslandCollapse = {
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
  scrollY: SharedValue<number>;
  /** Avatar center in window coordinates when the page is scrolled to the top; 0 until measured. */
  avatarCenterY: SharedValue<number>;
  /** 0 = expanded profile, 1 = avatar has reached the island (or the compact bar). */
  progress: SharedValue<number>;
  /** Window y the avatar travels to. */
  targetY: number;
  /** Height the avatar shrinks to at the end of the transition. */
  targetSize: number;
  hasIsland: boolean;
  /** JS-side mirror of "the compact bar is showing", for pointer events. */
  isCollapsed: boolean;
  topInset: number;
  /** Set by `IslandAvatarAnchor`; measures where the avatar sits on screen. */
  measureAnchorRef: RefObject<(() => void) | null>;
  /**
   * Minimum scroll content height, so even a short profile can scroll far enough for the avatar
   * to reach the island. Apply it to the scroll view's `contentContainerStyle`.
   */
  contentMinHeight: number;
  /**
   * Re-measures the avatar on the next frame. Pass it to the scroll view's `onLayout` and
   * `onContentSizeChange`: content above the avatar can move it without firing its own onLayout.
   */
  remeasure: () => void;
};

/**
 * Scroll-driven "avatar goes into the Dynamic Island" transition, like Telegram's profile.
 * The avatar rides up with the content, so its center reaches the island exactly when the page has
 * scrolled by the distance between them; along the way it shrinks to the island's height, and the
 * pieces built on this hook darken and fade it so it looks absorbed. Phones without an island use
 * the compact title bar as the target instead.
 */
export function useIslandCollapse(): IslandCollapse {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const hasIsland = Platform.OS === 'ios' && insets.top >= ISLAND_MIN_TOP_INSET;
  // Newer models sit the island a little lower along with their larger top inset.
  const islandCenterY = ISLAND_TOP + ISLAND_HEIGHT / 2 + Math.max(0, insets.top - 59) / 2;
  const targetY = hasIsland ? islandCenterY : insets.top + COLLAPSED_BAR_HEIGHT / 2;
  const targetSize = hasIsland ? ISLAND_HEIGHT : 28;

  const scrollY = useSharedValue(0);
  const avatarCenterY = useSharedValue(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const measureAnchorRef = useRef<(() => void) | null>(null);
  const remeasure = useCallback(() => {
    requestAnimationFrame(() => measureAnchorRef.current?.());
  }, []);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });

  const progress = useDerivedValue(() => {
    const distance = avatarCenterY.get() - targetY;
    if (distance <= 0) return 0;
    return clamp(scrollY.get() / distance, 0, 1);
  });

  useAnimatedReaction(
    () => progress.get() >= COLLAPSED_AT,
    (collapsed, previous) => {
      if (collapsed !== previous) scheduleOnRN(setIsCollapsed, collapsed);
    },
  );

  return {
    scrollHandler,
    scrollY,
    avatarCenterY,
    progress,
    targetY,
    targetSize,
    hasIsland,
    isCollapsed,
    topInset: insets.top,
    measureAnchorRef,
    remeasure,
    // The collapse distance is at most ~250pt (avatar center to island) on any layout.
    contentMinHeight: windowHeight + 250,
  };
}
