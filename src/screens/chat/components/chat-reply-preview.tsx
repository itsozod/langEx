import { Pressable, View } from 'react-native';
import type { ReplyPreviewProps } from 'react-native-gifted-chat';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatStyles } from '../styles/chat-styles';

export function ChatReplyPreview({
  replyMessage,
  onClearReply,
  currentUserId,
}: ReplyPreviewProps & { currentUserId?: string }) {
  const styles = useChatStyles();
  const replyAuthor =
    String(replyMessage.user._id) === String(currentUserId)
      ? 'yourself'
      : replyMessage.user.name || 'your partner';

  return (
    <View style={styles.replyPreview}>
      <View style={styles.replyPreviewAccent} />
      <View style={styles.replyPreviewCopy}>
        <ThemedText type="bold" numberOfLines={1} style={styles.replyPreviewTitle}>
          Replying to {replyAuthor}
        </ThemedText>
        <ThemedText numberOfLines={1} style={styles.replyPreviewText}>
          {replyMessage.text}
        </ThemedText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cancel reply"
        hitSlop={8}
        onPress={onClearReply}
        style={({ pressed }) => [styles.replyPreviewClose, pressed && styles.pressed]}>
        <SymbolView
          name={{ ios: 'xmark', android: 'close', web: 'close' }}
          size={16}
          weight="semibold"
          tintColor={styles.replyPreviewCloseColor.color}
        />
      </Pressable>
    </View>
  );
}
