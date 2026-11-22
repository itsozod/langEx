import { ActivityIndicator, Pressable, View } from 'react-native';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useGroupStyles } from '../styles/group-styles';
import { useTranslation } from 'react-i18next';
import { useUiTokens } from '@/shared/hooks/use-ui-tokens';

type GroupListStateProps = {
  message: string;
  onRetry?: () => void;
  title: string;
  type: 'empty' | 'error' | 'loading';
};

export function GroupListState({ message, onRetry, title, type }: GroupListStateProps) {
  const styles = useGroupStyles();
  const tokens = useUiTokens();
  const { t } = useTranslation();

  return (
    <View style={styles.stateCard}>
      <View style={styles.stateIcon}>
        {type === 'loading' ? (
          <ActivityIndicator color={tokens.loader} />
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
            {t('actions.tryAgain')}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}
