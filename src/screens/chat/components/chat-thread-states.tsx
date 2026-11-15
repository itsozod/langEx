import { View } from 'react-native';

import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatThreadStyles } from '../styles/chat-thread-styles';
import { useTranslation } from 'react-i18next';

export function ChatEmptyState() {
  const styles = useChatThreadStyles();
  const { t } = useTranslation('chat');

  return (
    <View style={styles.emptyChat}>
      <ThemedText type="bold" style={styles.emptyTitle}>
        {t('empty.title')}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.emptyMessage}>
        {t('empty.message')}
      </ThemedText>
    </View>
  );
}

export function DeletedUserNotice() {
  const styles = useChatThreadStyles();
  const { t } = useTranslation('chat');

  return (
    <View style={styles.deletedUserNotice}>
      <ThemedText type="bold" style={styles.deletedUserTitle}>
        {t('deletedUser.title')}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.deletedUserMessage}>
        {t('deletedUser.message')}
      </ThemedText>
    </View>
  );
}
