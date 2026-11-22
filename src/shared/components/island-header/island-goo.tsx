import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  clamp,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useDerivedValue,
} from 'react-native-reanimated';
import type { ComponentType, ReactNode } from 'react';
import Svg, { Defs, Image, LinearGradient, Path, Pattern, Stop } from 'react-native-svg';

import { ISLAND_HEIGHT, ISLAND_WIDTH, type IslandCollapse } from './use-island-collapse';

const HIDDEN = { d: 'M 0 0 Z', visible: 0 };

// Every animated prop change redraws the whole SVG, so keep it to two paths and no filters
// (an SVG blur filter runs on the CPU each frame and made scrolling lag). The neck stays mounted so
// its photo is loaded before it's needed; while hidden it doesn't redraw at all.
const AnimatedPath = Animated.createAnimatedComponent(Path);
// react-native-svg's `Defs` typing drops `children` under this project's React types.
const SvgDefs = Defs as unknown as ComponentType<{ children?: ReactNode }>;

/** Distance (pt) between avatar and island at which the neck starts to form. */
const NECK_REACH = 46;
/** Drawing area height; covers the island and the last stretch of the avatar's path. */
const CANVAS_HEIGHT = 220;
/**
 * The neck is filled with a small area from the top of the photo, magnified this many times. At
 * that zoom the photo turns into smooth color, so the neck reads as the blurred image stretching.
 */
const SMEAR_ZOOM = 8;
/** How dark the avatar (and so the neck) gets. */
export const MAX_DIM = 0.55;

type IslandGooProps = {
  collapse: IslandCollapse;
  size: number;
  /** Avatar photo; without one the neck is drawn dark. */
  imageUri?: string | null;
};

/**
 * The "gooey" neck between the avatar and the Dynamic Island. Drawn from the island's bottom edge
 * down to the top of the avatar, it starts as a thin pinched thread and thickens as the two
 * approach. It's made of the avatar's own photo (magnified into soft color and dimmed like the
 * avatar), fading to island black at the top, so it looks like the image itself is being pulled
 * in. Reshaped on the UI thread every frame from the scroll position.
 */
export function IslandGoo({ collapse, size, imageUri }: IslandGooProps) {
  const { width } = useWindowDimensions();
  const { avatarCenterY, scrollY, progress, targetY, targetSize } = collapse;
  const endScale = targetSize / size;
  const centerX = width / 2;
  const islandBottom = targetY + ISLAND_HEIGHT / 2;
  const smearSize = size * SMEAR_ZOOM;

  const shape = useDerivedValue(() => {
    const value = progress.get();
    const radius = (size / 2) * interpolate(value, [0, 1], [1, endScale], Extrapolation.CLAMP);
    const centerY = avatarCenterY.get() - scrollY.get();
    const gap = centerY - radius - islandBottom;
    // 0 = too far apart for a neck, 1 = touching.
    const pull = clamp(1 - gap / NECK_REACH, 0, 1);
    // Hidden: return the same values every frame, so Reanimated skips the (costly) SVG redraw.
    if (pull === 0 || value <= 0.4 || value >= 1) return HIDDEN;

    const topHalfWidth = interpolate(pull, [0, 1], [5, ISLAND_WIDTH * 0.3]);
    const attachAngle = interpolate(pull, [0, 1], [0.35, 1.15]);
    const waist = interpolate(pull * pull, [0, 1], [1.5, radius * 0.85]);
    const attachX = radius * Math.sin(attachAngle);
    const attachY = centerY - radius * Math.cos(attachAngle);
    const top = islandBottom - 6;
    const midY = (top + attachY) / 2;

    const d =
      `M ${centerX - topHalfWidth} ${top} ` +
      `Q ${centerX - waist} ${midY} ${centerX - attachX} ${attachY} ` +
      // Follow the avatar's top edge so the neck only fills the space outside the circle.
      `A ${radius} ${radius} 0 0 1 ${centerX + attachX} ${attachY} ` +
      `Q ${centerX + waist} ${midY} ${centerX + topHalfWidth} ${top} Z`;

    // Appears once the avatar is well blurred, and leaves with it at the very end.
    const visible =
      interpolate(pull, [0, 0.2], [0, 1], Extrapolation.CLAMP) *
      interpolate(value, [0.4, 0.55], [0, 1], Extrapolation.CLAMP) *
      interpolate(value, [0.86, 1], [1, 0], Extrapolation.CLAMP);

    return { d, visible };
  });

  const bodyProps = useAnimatedProps(() => ({
    d: shape.get().d,
    fillOpacity: shape.get().visible,
  }));
  const shadeProps = useAnimatedProps(() => ({
    d: shape.get().d,
    fillOpacity: shape.get().visible,
  }));

  return (
    <View pointerEvents="none" style={[styles.canvas, { width }]}>
      <Svg height={CANVAS_HEIGHT} width={width}>
        <SvgDefs>
          {imageUri ? (
            // Fixed under the island: the neck always forms in this zone, and the magnified photo
            // there is smooth color, so it doesn't need to follow the avatar exactly.
            <Pattern
              height={smearSize}
              id="avatarSmear"
              patternUnits="userSpaceOnUse"
              width={smearSize}
              x={centerX - smearSize / 2}
              y={islandBottom - smearSize * 0.06}>
              <Image
                height={smearSize}
                href={{ uri: imageUri }}
                preserveAspectRatio="xMidYMid slice"
                width={smearSize}
              />
            </Pattern>
          ) : null}
          <LinearGradient id="intoIsland" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity={1} />
            <Stop offset="0.45" stopColor="#000000" stopOpacity={0.75} />
            {/* Near the avatar the photo shows through, dimmed about as much as the avatar. */}
            <Stop offset="1" stopColor="#000000" stopOpacity={MAX_DIM * 0.7} />
          </LinearGradient>
        </SvgDefs>
        <AnimatedPath animatedProps={bodyProps} fill={imageUri ? 'url(#avatarSmear)' : '#1A1A1A'} />
        <AnimatedPath animatedProps={shadeProps} fill="url(#intoIsland)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { position: 'absolute', top: 0, left: 0, height: CANVAS_HEIGHT },
});
