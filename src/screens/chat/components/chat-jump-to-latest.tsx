import { Text } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { SymbolView } from '@/shared/components/ui/symbol-view';

import { useChatStyles } from '../styles/chat-styles';
import { useChatThreadStyles } from '../styles/chat-thread-styles';

type ChatJumpToLatestProps = {
  isAlwaysVisible: boolean;
  isScrolledAway: boolean;
  newMessageCount: number;
  onPress: () => void;
};

/**
 * Mirrors the arrow Instagram shows once the thread is no longer at the newest message. It remains
 * visible in a historical window until the reader either taps it or manually reaches the true end.
 */
export function ChatJumpToLatest({
  isAlwaysVisible,
  isScrolledAway,
  newMessageCount,
  onPress,
}: ChatJumpToLatestProps) {
  const styles = useChatStyles();
  const threadStyles = useChatThreadStyles();

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
