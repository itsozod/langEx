import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useChatThreadStyles } from '../styles/chat-thread-styles';

const DOT_COUNT = 3;
const DOT_STAGGER_MS = 120;
const DOT_TRAVEL_MS = 210;
const DOT_REST_MS = 360;
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

export function ChatTypingIndicator() {
  const styles = useChatThreadStyles();

  return (
    <View
      accessibilityLabel="Partner is typing"
      accessibilityLiveRegion="polite"
      accessible
      style={styles.typingIndicator}>
      {Array.from({ length: DOT_COUNT }, (_, index) => (
        <TypingDot index={index} key={index} />
      ))}
    </View>
  );
}

function TypingDot({ index }: { index: number }) {
  const styles = useChatThreadStyles();
  const reducedMotion = useReducedMotion();
  const lift = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      lift.set(0);
      return;
    }

    lift.set(
      withDelay(
        index * DOT_STAGGER_MS,
        withRepeat(
          withSequence(
            withTiming(-4, { duration: DOT_TRAVEL_MS, easing: EASE_IN_OUT }),
            withTiming(0, { duration: DOT_TRAVEL_MS, easing: EASE_IN_OUT }),
            withDelay(DOT_REST_MS, withTiming(0, { duration: 0 })),
          ),
          -1,
        ),
      ),
    );

    return () => cancelAnimation(lift);
  }, [index, lift, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion ? 0.72 : lift.get() < 0 ? 1 : 0.58,
    transform: [{ translateY: reducedMotion ? 0 : lift.get() }],
  }));

  return <Animated.View style={[styles.typingDot, animatedStyle]} />;
}
