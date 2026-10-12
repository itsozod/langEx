import { Alert, Clipboard, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatPinnedStyles } from '../styles/chat-pinned-styles';
import type { Message } from '../types/message.types';

type ChatPinnedMessageActionsProps = {
  canDelete: boolean;
  canModify: boolean;
  message: Message;
  onClose: () => void;
  onDelete: (messageId: string, fallbackMessage?: Message) => void;
  onUnpin: (messageId: string) => void;
  unpinPending: boolean;
};

export function ChatPinnedMessageActions({
  canDelete,
  canModify,
  message,
  onClose,
  onDelete,
  onUnpin,
  unpinPending,
}: ChatPinnedMessageActionsProps) {
  const styles = useChatPinnedStyles();
  const insets = useSafeAreaInsets();
  const canCopy = Boolean(message.content.trim());
  const copyMessage = () => {
    Clipboard.setString(message.content);
    onClose();
  };
  const deleteMessage = () => {
    onClose();
    Alert.alert('Delete message?', 'This removes it for everyone in the chat.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(message.id, message) },
    ]);
  };

  return (
    <View accessibilityViewIsModal style={styles.actionsLayer}>
      <Pressable
        accessibilityLabel="Close message actions"
        accessibilityRole="button"
        onPress={onClose}
        style={styles.actionsBackdrop}
      />
      <View style={[styles.actionsCard, { marginBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.actionsHeader}>
          <ThemedText style={styles.actionsTitle}>Message actions</ThemedText>
          <ThemedText numberOfLines={2} style={styles.actionsPreview}>
            {message.content.trim() || 'Photo'}
          </ThemedText>
        </View>
        {canCopy ? (
          <Pressable
            accessibilityRole="button"
            onPress={copyMessage}
            style={({ pressed }) => [styles.actionsItem, pressed && styles.actionsItemPressed]}>
            <SymbolView
              name={{ ios: 'doc.on.doc', android: 'content_copy', web: 'content_copy' }}
              size={19}
              tintColor={styles.actionsIcon.color}
            />
            <ThemedText style={styles.actionsLabel}>Copy</ThemedText>
          </Pressable>
        ) : null}
        {canModify ? (
          <>
            <View style={styles.actionsDivider} />
            <Pressable
              accessibilityRole="button"
              disabled={unpinPending}
              onPress={() => {
                onClose();
                onUnpin(message.id);
              }}
              style={({ pressed }) => [
                styles.actionsItem,
                pressed && styles.actionsItemPressed,
                unpinPending && styles.actionsItemDisabled,
              ]}>
              <SymbolView
                name={{ ios: 'pin.slash', android: 'push_pin', web: 'push_pin' }}
                size={19}
                tintColor={styles.actionsIcon.color}
              />
              <ThemedText style={styles.actionsLabel}>Unpin</ThemedText>
            </Pressable>
          </>
        ) : null}
        {canModify && canDelete ? (
          <>
            <View style={styles.actionsDivider} />
            <Pressable
              accessibilityRole="button"
              onPress={deleteMessage}
              style={({ pressed }) => [styles.actionsItem, pressed && styles.actionsItemPressed]}>
              <SymbolView
                name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                size={19}
                tintColor={styles.actionsDestructive.color}
              />
              <ThemedText style={[styles.actionsLabel, styles.actionsDestructive]}>
                Delete
              </ThemedText>
            </Pressable>
          </>
        ) : null}
      </View>
    </View>
  );
}
