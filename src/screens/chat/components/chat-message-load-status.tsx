import { ActivityIndicator, Pressable, View } from 'react-native';

import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatThreadStyles } from '../styles/chat-thread-styles';

type ChatMessageLoadStatusProps = {
  failed: boolean;
  loading: boolean;
  onRetry: () => void;
};

export function ChatMessageLoadStatus({ failed, loading, onRetry }: ChatMessageLoadStatusProps) {
  const styles = useChatThreadStyles();

  if (failed) {
    return (
      <View style={styles.messageLoadStatusLayer}>
        <Pressable
          accessibilityHint="Attempts to load the replied-to message again"
          accessibilityLabel="Message couldn't load. Tap to retry."
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.messageLoadStatus,
            pressed && styles.messageLoadStatusPressed,
          ]}>
          <ThemedText style={[styles.messageLoadStatusText, styles.messageLoadErrorText]}>
            Couldn&apos;t load message · Tap to retry
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  if (!loading) return null;

  return (
    <View pointerEvents="none" style={styles.messageLoadStatusLayer}>
      <View
        accessibilityLabel="Loading replied-to message"
        accessibilityLiveRegion="polite"
        accessibilityRole="progressbar"
        accessible
        style={styles.messageLoadStatus}>
        <ActivityIndicator color="#7460D3" size="small" />
        <ThemedText style={styles.messageLoadStatusText}>Loading message…</ThemedText>
      </View>
    </View>
  );
}
