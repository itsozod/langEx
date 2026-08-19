import { useState } from 'react';
import { Pressable } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedReaction,
  type SharedValue,
} from 'react-native-reanimated';

import { SymbolView } from '@/shared/components/ui/symbol-view';

import { useChatStyles } from '../styles/chat-styles';

/** How far up the thread has to be scrolled before the button offers a way back down. */
const SCROLLED_AWAY_OFFSET = 420;

type ChatJumpToLatestProps = {
  isAlwaysVisible: boolean;
  onPress: () => void;
  scrolledY: SharedValue<number>;
};

/**
 * Mirrors the arrow Instagram shows once the thread is no longer at the newest message. It is
 * always offered while an older window is open, because scrolling alone cannot get back from there.
 */
export function ChatJumpToLatest({ isAlwaysVisible, onPress, scrolledY }: ChatJumpToLatestProps) {
  const styles = useChatStyles();
  const [isScrolledAway, setIsScrolledAway] = useState(false);

  // Reacting on the UI thread keeps per-frame scrolling out of React; only crossings re-render.
  useAnimatedReaction(
    () => scrolledY.value > SCROLLED_AWAY_OFFSET,
    (isAway, wasAway) => {
      if (isAway !== wasAway) runOnJS(setIsScrolledAway)(isAway);
    },
  );

  if (!isAlwaysVisible && !isScrolledAway) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(140)}
      exiting={FadeOut.duration(140)}
      style={styles.jumpToLatest}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Jump to the latest messages"
        onPress={onPress}
        style={({ pressed }) => [styles.jumpToLatestButton, pressed && styles.pressed]}>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'arrow_drop_down', web: 'arrow_drop_down' }}
          size={20}
          weight="semibold"
          tintColor="#FFFFFF"
        />
      </Pressable>
    </Animated.View>
  );
}
