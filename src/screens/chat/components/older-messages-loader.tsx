import { ActivityIndicator, Pressable, View } from 'react-native';
import type { LoadEarlierMessagesProps } from 'react-native-gifted-chat';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatStyles } from '../styles/chat-styles';

export function OlderMessagesLoader({
  isLoading,
  onPress,
  hasError,
}: LoadEarlierMessagesProps & { hasError: boolean }) {
  const styles = useChatStyles();

  if (isLoading) {
    return (
      <View style={styles.olderMessagesLoader}>
        <ActivityIndicator size="small" color={styles.olderMessagesAccent.color} />
        <ThemedText style={styles.olderMessagesText}>Loading older messages…</ThemedText>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hasError ? 'Retry loading older messages' : 'Load older messages'}
      onPress={onPress}
      style={({ pressed }) => [styles.olderMessagesLoader, pressed && styles.pressed]}>
      <SymbolView
        name={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }}
        size={15}
        tintColor={styles.olderMessagesAccent.color}
      />
      <ThemedText style={styles.olderMessagesText}>
        {hasError ? 'Couldn’t load older messages — tap to retry' : 'Load older messages'}
      </ThemedText>
    </Pressable>
  );
}
