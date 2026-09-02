import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '@/providers/theme-provider';
import { getInitials } from '@/screens/profile/utils/language-flags';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAccountTransitionStore } from '@/shared/store/account-transition-store';
import { useUserStore } from '@/shared/store/user.store';

const ORBIT_RADIUS = 61;

export function AccountTransitionOverlay() {
  const { theme } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const targetAccountId = useAccountTransitionStore((state) => state.targetAccountId);
  const targetUser = useUserStore((state) =>
    state.users.find((user) => user.id === targetAccountId),
  );
  const orbit = useSharedValue(0);

  useEffect(() => {
    if (!targetAccountId || reducedMotion) return;

    orbit.set(
      withRepeat(
        withTiming(1, { duration: 1_400, easing: Easing.linear }),
        -1,
        false,
        undefined,
        ReduceMotion.System,
      ),
    );

    return () => cancelAnimation(orbit);
  }, [orbit, reducedMotion, targetAccountId]);

  const leadingBubbleStyle = useAnimatedStyle(() => {
    const angle = orbit.get() * Math.PI * 2;
    return {
      transform: [
        { translateX: Math.cos(angle) * ORBIT_RADIUS },
        { translateY: Math.sin(angle) * ORBIT_RADIUS },
        { scale: 0.94 + Math.sin(angle) * 0.06 },
      ],
    };
  });

  const trailingBubbleStyle = useAnimatedStyle(() => {
    const angle = orbit.get() * Math.PI * 2 + Math.PI;
    return {
      transform: [
        { translateX: Math.cos(angle) * ORBIT_RADIUS },
        { translateY: Math.sin(angle) * ORBIT_RADIUS },
        { scale: 0.94 + Math.sin(angle) * 0.06 },
      ],
    };
  });

  if (!targetAccountId || !targetUser) return null;

  const isDark = theme === 'dark';
  const displayName = targetUser.displayName?.trim() || targetUser.email.split('@')[0];

  return (
    <Animated.View
      accessibilityLabel={`Switching to ${displayName}`}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityViewIsModal
      entering={FadeIn.duration(180).reduceMotion(ReduceMotion.System)}
      exiting={FadeOut.duration(180).reduceMotion(ReduceMotion.System)}
      style={[styles.overlay, isDark ? styles.overlayDark : styles.overlayLight]}>
      <View style={styles.visual} importantForAccessibility="no-hide-descendants">
        <View style={[styles.halo, isDark ? styles.haloDark : styles.haloLight]} />
        <View style={[styles.avatarFrame, isDark && styles.avatarFrameDark]}>
          {targetUser.avatarUrl ? (
            <Image
              source={{ uri: targetUser.avatarUrl }}
              contentFit="cover"
              transition={120}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarFallback, isDark && styles.avatarFallbackDark]}>
              <ThemedText style={[styles.initials, isDark && styles.initialsDark]}>
                {getInitials(targetUser.displayName, targetUser.email)}
              </ThemedText>
            </View>
          )}
        </View>

        <Animated.View style={[styles.bubble, styles.leadingBubble, leadingBubbleStyle]}>
          <SymbolView
            name={{ ios: 'bubble.left.fill', android: 'chat', web: 'chat' }}
            size={17}
            weight="semibold"
            tintColor="#FFFFFF"
          />
        </Animated.View>
        <Animated.View style={[styles.bubble, styles.trailingBubble, trailingBubbleStyle]}>
          <SymbolView
            name={{ ios: 'character.bubble.fill', android: 'chat_bubble_outline', web: 'chat' }}
            size={15}
            weight="semibold"
            tintColor={isDark ? '#211A31' : '#5140A8'}
          />
        </Animated.View>
      </View>

      <View style={styles.copy}>
        <ThemedText type="title" style={styles.title}>
          Switching to {displayName}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Bringing your conversations with you…
        </ThemedText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 100,
    elevation: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 34,
    paddingHorizontal: 28,
  },
  overlayLight: { backgroundColor: '#F8F5FF' },
  overlayDark: { backgroundColor: '#120E1B' },
  visual: { width: 190, height: 190, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 174,
    height: 174,
    borderRadius: 87,
    borderWidth: 1,
  },
  haloLight: { borderColor: 'rgba(102,84,199,0.19)', backgroundColor: '#F0EBFF' },
  haloDark: { borderColor: 'rgba(190,176,255,0.18)', backgroundColor: '#211A31' },
  avatarFrame: {
    width: 104,
    height: 104,
    padding: 5,
    borderRadius: 52,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 16px 34px rgba(77,58,158,0.22)',
  },
  avatarFrameDark: {
    backgroundColor: '#2C2440',
    boxShadow: '0 16px 36px rgba(0,0,0,0.42)',
  },
  avatar: { width: '100%', height: '100%', borderRadius: 47 },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 47,
    backgroundColor: '#DED5FA',
  },
  avatarFallbackDark: { backgroundColor: '#493D69' },
  initials: { color: '#5140A8', fontSize: 28, lineHeight: 36, fontWeight: '700' },
  initialsDark: { color: '#F0ECFF' },
  bubble: {
    position: 'absolute',
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    boxShadow: '0 8px 18px rgba(64,45,142,0.22)',
  },
  leadingBubble: { backgroundColor: '#6654C7' },
  trailingBubble: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#CFC4FF' },
  copy: { maxWidth: 320, alignItems: 'center', gap: 8 },
  title: { fontSize: 23, lineHeight: 31, letterSpacing: -0.35, textAlign: 'center' },
  subtitle: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
