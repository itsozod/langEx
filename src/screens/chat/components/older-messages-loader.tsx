import { ActivityIndicator, Pressable, View } from 'react-native';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatStyles } from '../styles/chat-styles';

export function OlderMessagesLoader({ isLoading, onPress, hasError }: MessagePageLoaderProps) {
  return (
    <MessagePageLoader
      direction="older"
      hasError={hasError}
      isLoading={isLoading}
      onPress={onPress}
      showIdleAction
    />
  );
}

export function NewerMessagesLoader(props: MessagePageLoaderProps) {
  return <MessagePageLoader {...props} direction="newer" />;
}

type MessagePageLoaderProps = {
  hasError: boolean;
  isLoading: boolean;
  onPress: () => void;
};

function MessagePageLoader({
  direction,
  hasError,
  isLoading,
  onPress,
  showIdleAction = false,
}: MessagePageLoaderProps & { direction: 'newer' | 'older'; showIdleAction?: boolean }) {
  const styles = useChatStyles();

  if (isLoading) {
    return (
      <View style={styles.olderMessagesLoader}>
        <ActivityIndicator size="small" color={styles.olderMessagesAccent.color} />
        <ThemedText style={styles.olderMessagesText}>{`Loading ${direction} messages…`}</ThemedText>
      </View>
    );
  }

  if (!hasError && !showIdleAction) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        hasError ? `Retry loading ${direction} messages` : `Load ${direction} messages`
      }
      onPress={onPress}
      style={({ pressed }) => [styles.olderMessagesLoader, pressed && styles.pressed]}>
      <SymbolView
        name={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }}
        size={15}
        tintColor={styles.olderMessagesAccent.color}
      />
      <ThemedText style={styles.olderMessagesText}>
        {hasError
          ? `Couldn’t load ${direction} messages — tap to retry`
          : `Load ${direction} messages`}
      </ThemedText>
    </Pressable>
  );
}
