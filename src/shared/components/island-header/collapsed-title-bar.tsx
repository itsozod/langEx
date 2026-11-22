import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { ThemedText } from '@/shared/components/ui/themed-text';
import { useTheme } from '@/shared/hooks/use-theme';
import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';

import { COLLAPSED_BAR_HEIGHT, type IslandCollapse } from './use-island-collapse';

type CollapsedTitleBarProps = {
  collapse: IslandCollapse;
  title: string;
  left?: ReactNode;
  right?: ReactNode;
};

/** Compact bar with just the name; fades in as the avatar disappears into the island. */
export function CollapsedTitleBar({ collapse, title, left, right }: CollapsedTitleBarProps) {
  const tokens = useUiTokens();
  const theme = useTheme();
  const { progress, isCollapsed, topInset } = collapse;

  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0.6, 0.9], [0, 1], Extrapolation.CLAMP),
  }));
  const titleStyle = useAnimatedStyle(() => {
    const value = progress.get();
    return {
      opacity: interpolate(value, [0.8, 1], [0, 1], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(value, [0.8, 1], [8, 0], Extrapolation.CLAMP) }],
    };
  });

  return (
    <Animated.View
      pointerEvents={isCollapsed ? 'box-none' : 'none'}
      style={[
        styles.bar,
        {
          height: topInset + COLLAPSED_BAR_HEIGHT,
          paddingTop: topInset,
          backgroundColor: theme.heroGradientStart,
          borderBottomColor: tokens.hairline,
        },
        barStyle,
      ]}>
      <View style={styles.side}>{left}</View>
      <Animated.View style={[styles.titleWrap, titleStyle]}>
        <ThemedText numberOfLines={1} style={[styles.title, { color: tokens.text }]}>
          {title}
        </ThemedText>
      </Animated.View>
      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  side: { width: 48, alignItems: 'flex-start' },
  sideRight: { alignItems: 'flex-end' },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: { fontFamily: FONT.semibold, fontSize: 17, lineHeight: 22 },
});
