import { View } from 'react-native';

import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatThreadStyles } from '../styles/chat-thread-styles';

export function ChatEmptyState() {
  const styles = useChatThreadStyles();

  return (
    <View style={styles.emptyChat}>
      <ThemedText type="bold" style={styles.emptyTitle}>
        Say hello 👋
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.emptyMessage}>
        Send the first message to start your conversation.
      </ThemedText>
    </View>
  );
}

export function DeletedUserNotice() {
  const styles = useChatThreadStyles();

  return (
    <View style={styles.deletedUserNotice}>
      <ThemedText type="bold" style={styles.deletedUserTitle}>
        User is deleted
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.deletedUserMessage}>
        You can still view your message history, but this conversation is read-only.
      </ThemedText>
    </View>
  );
}
