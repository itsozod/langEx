import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { type ReactNode, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { IslandGoo, MAX_DIM } from './island-goo';
import type { IslandCollapse } from './use-island-collapse';

/** Roughly the native push transition, after which the page layout has settled. */
const SETTLE_REMEASURE_MS = 450;

type AnchorProps = { collapse: IslandCollapse; size: number };

/**
 * Holds the avatar's place in the page and reports where it sits on screen. The visible avatar is
 * drawn by `IslandAvatar` as an overlay, so it can pass above the compact title bar on its way up.
 */
export function IslandAvatarAnchor({ collapse, size }: AnchorProps) {
  const ref = useRef<View>(null);
  const { avatarCenterY, measureAnchorRef, remeasure, scrollY } = collapse;

  useEffect(() => {
    measureAnchorRef.current = () => {
      ref.current?.measureInWindow((_x, y, _width, height) => {
        // Store the position as if scrolled to the top, so the overlay can follow the scroll.
        if (height > 0) avatarCenterY.set(y + height / 2 + scrollY.get());
      });
    };
    return () => {
      measureAnchorRef.current = null;
    };
  }, [avatarCenterY, measureAnchorRef, scrollY]);

  // Tab switches and returning from other screens can shift the page under the avatar.
  useFocusEffect(remeasure);
  // Safe-area padding and late layout can move the page after the first measure; check again
  // once the push animation has settled.
  useEffect(() => {
    const timer = setTimeout(remeasure, SETTLE_REMEASURE_MS);
    return () => clearTimeout(timer);
  }, [remeasure]);

  return (
    <View
      ref={ref}
      accessible={false}
      onLayout={remeasure}
      pointerEvents="none"
      style={{ width: size, height: size }}
    />
  );
}

type AvatarProps = {
  collapse: IslandCollapse;
  size: number;
  children: ReactNode;
  /**
   * Photo shown behind the avatar. A pre-blurred copy fades in over it on the way up, so the
   * avatar looks like it melts into the island (React Native can't animate a real blur on iOS).
   */
  blurImageUri?: string | null;
  /** Small overlays such as an edit badge; they fade out first so only the circle travels. */
  badge?: ReactNode;
};

/**
 * Pre-blurred copies faded in one after another, so the blur keeps growing as the avatar rises
 * (React Native can't animate a real blur radius on iOS). The last one is a soft gray blob.
 */
const BLUR_STEPS = [
  { radius: 8, range: [0.12, 0.3] },
  { radius: 22, range: [0.26, 0.45] },
  { radius: 48, range: [0.4, 0.6] },
] as const;

type BlurLayerProps = {
  uri: string;
  radius: number;
  range: readonly [number, number];
  progress: IslandCollapse['progress'];
  borderRadius: number;
};

function BlurLayer({ uri, radius, range, progress, borderRadius }: BlurLayerProps) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), range, [0, 1], Extrapolation.CLAMP),
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.fill, styles.clip, { borderRadius }, style]}>
      <Image blurRadius={radius} contentFit="cover" source={{ uri }} style={styles.fill} />
    </Animated.View>
  );
}

/**
 * The avatar overlay: follows the anchor while scrolling, shrinks toward the island, darkens to
 * black and fades as it arrives so it looks absorbed. Without an island it only shrinks and fades.
 */
export function IslandAvatar({ collapse, size, children, blurImageUri, badge }: AvatarProps) {
  const { avatarCenterY, scrollY, progress, targetSize, hasIsland } = collapse;
  const endScale = targetSize / size;

  const containerStyle = useAnimatedStyle(() => {
    const measured = avatarCenterY.get() > 0;
    const value = progress.get();
    return {
      opacity: measured
        ? hasIsland
          ? interpolate(value, [0.86, 1], [1, 0], Extrapolation.CLAMP)
          : interpolate(value, [0.55, 0.9], [1, 0], Extrapolation.CLAMP)
        : 0,
      transform: [
        { translateY: avatarCenterY.get() - size / 2 - scrollY.get() },
        { scale: interpolate(value, [0, 1], [1, endScale], Extrapolation.CLAMP) },
      ],
    };
  });

  // Sequence on the way up: sharp photo -> growing blur -> dimmed blob pulled in by the neck -> absorbed.
  const inkStyle = useAnimatedStyle(() => ({
    opacity: hasIsland
      ? interpolate(progress.get(), [0.5, 0.9], [0, MAX_DIM], Extrapolation.CLAMP)
      : 0,
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.25], [1, 0], Extrapolation.CLAMP),
  }));
  const circle = { borderRadius: size / 2 };

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <Animated.View style={[{ width: size, height: size }, containerStyle]}>
        {children}
        {blurImageUri
          ? BLUR_STEPS.map((step) => (
              <BlurLayer
                key={step.radius}
                borderRadius={size / 2}
                progress={progress}
                radius={step.radius}
                range={step.range}
                uri={blurImageUri}
              />
            ))
          : null}
        {/* Dims the blurred photo as it merges; it stays image-colored, like Telegram's. */}
        <Animated.View pointerEvents="none" style={[styles.fill, styles.ink, circle, inkStyle]} />
        {badge ? (
          <Animated.View pointerEvents="box-none" style={[styles.fill, badgeStyle]}>
            {badge}
          </Animated.View>
        ) : null}
      </Animated.View>
      {hasIsland ? <IslandGoo collapse={collapse} imageUri={blurImageUri} size={size} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  fill: { ...StyleSheet.absoluteFill },
  clip: { overflow: 'hidden' },
  ink: { backgroundColor: '#000000' },
});
