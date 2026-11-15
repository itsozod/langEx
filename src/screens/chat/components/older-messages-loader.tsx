import { ActivityIndicator, Pressable, View } from 'react-native';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatStyles } from '../styles/chat-styles';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('chat');

  if (isLoading) {
    return (
      <View style={styles.olderMessagesLoader}>
        <ActivityIndicator size="small" color={styles.olderMessagesAccent.color} />
        <ThemedText style={styles.olderMessagesText}>
          {t(`pageLoader.${direction}.loading`)}
        </ThemedText>
      </View>
    );
  }

  if (!hasError && !showIdleAction) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        hasError ? t(`pageLoader.${direction}.retry`) : t(`pageLoader.${direction}.load`)
      }
      onPress={onPress}
      style={({ pressed }) => [styles.olderMessagesLoader, pressed && styles.pressed]}>
      <SymbolView
        name={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }}
        size={15}
        tintColor={styles.olderMessagesAccent.color}
      />
      <ThemedText style={styles.olderMessagesText}>
        {hasError ? t(`pageLoader.${direction}.failed`) : t(`pageLoader.${direction}.load`)}
      </ThemedText>
    </Pressable>
  );
}
