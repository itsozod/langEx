import { ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GradientBackground from '@/shared/components/ui/gradient-background';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatStyles } from '../styles/chat-styles';

export function ChatLoadingState() {
  const styles = useChatStyles();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#6654C7" />
        <ThemedText themeColor="textSecondary" style={styles.loadingText}>
          Loading messages…
        </ThemedText>
      </SafeAreaView>
    </GradientBackground>
  );
}

export function ChatErrorState({ error, onBack }: { error: unknown; onBack: () => void }) {
  const styles = useChatStyles();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.centered}>
        <ThemedText type="bold" style={styles.errorTitle}>
          Couldn&apos;t open this chat
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.errorMessage}>
          {error instanceof Error ? error.message : 'This conversation is unavailable.'}
        </ThemedText>
        <Pressable onPress={onBack} style={styles.errorButton}>
          <ThemedText style={styles.errorButtonText}>Back to chats</ThemedText>
        </Pressable>
      </SafeAreaView>
    </GradientBackground>
  );
}

export function ChatErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  const styles = useChatStyles();

  return (
    <Pressable onPress={onDismiss} style={styles.errorBanner}>
      <SymbolView
        name={{ ios: 'exclamationmark.circle.fill', android: 'error', web: 'error' }}
        size={16}
        tintColor={styles.errorBannerText.color}
      />
      <ThemedText numberOfLines={2} style={styles.errorBannerText}>
        {message}
      </ThemedText>
    </Pressable>
  );
}
