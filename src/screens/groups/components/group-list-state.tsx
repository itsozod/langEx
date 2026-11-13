import { ActivityIndicator, Pressable, View } from 'react-native';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useGroupStyles } from '../styles/group-styles';

type GroupListStateProps = {
  message: string;
  onRetry?: () => void;
  title: string;
  type: 'empty' | 'error' | 'loading';
};

export function GroupListState({ message, onRetry, title, type }: GroupListStateProps) {
  const styles = useGroupStyles();

  return (
    <View style={styles.stateCard}>
      <View style={styles.stateIcon}>
        {type === 'loading' ? (
          <ActivityIndicator color={styles.stateIconColor.color} />
        ) : (
          <SymbolView
            name={
              type === 'error'
                ? { ios: 'wifi.exclamationmark', android: 'wifi_off', web: 'wifi_off' }
                : { ios: 'person.2.slash', android: 'person_off', web: 'person_off' }
            }
            size={25}
            tintColor={styles.stateIconColor.color}
          />
        )}
      </View>
      <ThemedText type="bold" style={styles.stateTitle}>
        {title}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.stateMessage}>
        {message}
      </ThemedText>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
          <ThemedText type="bold" style={styles.retryText}>
            Try again
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}
