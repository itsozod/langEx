import { useState } from 'react';
import { Text } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedReaction,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { SymbolView } from '@/shared/components/ui/symbol-view';

import { useChatStyles } from '../styles/chat-styles';
import { useChatThreadStyles } from '../styles/chat-thread-styles';

/** How far up the thread has to be scrolled before the button offers a way back down. */
const SCROLLED_AWAY_OFFSET = 420;

type ChatJumpToLatestProps = {
  isAlwaysVisible: boolean;
  newMessageCount: number;
  onPress: () => void;
  scrolledY: SharedValue<number>;
};

/**
 * Mirrors the arrow Instagram shows once the thread is no longer at the newest message. It is
 * always offered while an older window is open, because scrolling alone cannot get back from there.
 */
export function ChatJumpToLatest({
  isAlwaysVisible,
  newMessageCount,
  onPress,
  scrolledY,
}: ChatJumpToLatestProps) {
  const styles = useChatStyles();
  const threadStyles = useChatThreadStyles();
  const [isScrolledAway, setIsScrolledAway] = useState(false);

  // Reacting on the UI thread keeps per-frame scrolling out of React; only crossings re-render.
  useAnimatedReaction(
    () => scrolledY.get() > SCROLLED_AWAY_OFFSET,
    (isAway, wasAway) => {
      if (isAway !== wasAway) scheduleOnRN(setIsScrolledAway, isAway);
    },
  );

  if (!isAlwaysVisible && !isScrolledAway && newMessageCount === 0) return null;

  const accessibilityLabel = newMessageCount
    ? `${newMessageCount} new ${newMessageCount === 1 ? 'message' : 'messages'}. Jump to latest.`
    : 'Jump to the latest messages';
  const badgeLabel = newMessageCount > 9 ? '9+' : String(newMessageCount);

  return (
    <Animated.View
      entering={FadeIn.duration(140)}
      exiting={FadeOut.duration(140)}
      style={threadStyles.jumpToLatest}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [threadStyles.jumpToLatestButton, pressed && styles.pressed]}>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'arrow_drop_down', web: 'arrow_drop_down' }}
          size={20}
          weight="semibold"
          tintColor="#FFFFFF"
        />
      </Pressable>
      {newMessageCount ? (
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={threadStyles.newMessageBadge}>
          {badgeLabel}
        </Text>
      ) : null}
    </Animated.View>
  );
}
