import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  type LayoutChangeEvent,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '@/providers/theme-provider';
import { useUiTokens } from '@/shared/hooks/use-ui-tokens';

const SWEEP_DURATION_MS = 1300;
const CLEAR = 'rgba(255,255,255,0)';

/**
 * A placeholder block with a soft highlight sweeping across it, so loading lists look alive.
 * Pass the block's size and radius through `style`. With Reduce Motion on it stays static.
 */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const tokens = useUiTokens();
  const { theme } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion || width === 0) return;
    progress.set(
      withRepeat(
        withTiming(1, { duration: SWEEP_DURATION_MS, easing: Easing.inOut(Easing.quad) }),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(progress);
  }, [progress, reducedMotion, width]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.get(), [0, 1], [-width, width]) }],
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth !== width) setWidth(nextWidth);
  };

  const highlight = theme === 'dark' ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.75)';

  return (
    <View
      accessible={false}
      onLayout={onLayout}
      style={[styles.block, { backgroundColor: tokens.fill }, style]}>
      {!reducedMotion && width > 0 ? (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, sweepStyle]}>
          <LinearGradient
            colors={[CLEAR, highlight, CLEAR]}
            end={{ x: 1, y: 0.5 }}
            start={{ x: 0, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { overflow: 'hidden' },
});
