import { View } from 'react-native';

import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatSystemMessageStyles } from '../styles/chat-system-message-styles';
import type { GiftedMessage } from '../types/message.types';
import { formatMessageSystemEvent } from '../utils/system-events';

type ChatSystemMessageProps = {
  currentUserId: string;
  message: GiftedMessage;
};

export function ChatSystemMessage({ currentUserId, message }: ChatSystemMessageProps) {
  const styles = useChatSystemMessageStyles();
  const text = formatMessageSystemEvent(message.systemEvent, currentUserId);

  if (!text) return null;

  return (
    <View accessibilityRole="text" style={styles.container}>
      <ThemedText style={styles.text}>{text}</ThemedText>
    </View>
  );
}
