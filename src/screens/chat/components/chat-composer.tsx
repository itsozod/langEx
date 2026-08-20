import { Pressable, View } from 'react-native';
import {
  InputToolbar,
  Send,
  type InputToolbarProps,
  type SendProps,
} from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatStyles } from '../styles/chat-styles';
import type { GiftedMessage } from '../types';

type ChatInputToolbarProps = InputToolbarProps<GiftedMessage> & {
  isEditing?: boolean;
  onCancelEdit?: () => void;
};

export function ChatInputToolbar({ isEditing, onCancelEdit, ...props }: ChatInputToolbarProps) {
  const styles = useChatStyles();
  const insets = useSafeAreaInsets();

  return (
    <View>
      {isEditing ? (
        <View style={styles.editBanner}>
          <SymbolView
            name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
            size={15}
            tintColor={styles.editBannerTitle.color}
          />
          <View style={styles.editBannerCopy}>
            <ThemedText style={styles.editBannerTitle}>Editing message</ThemedText>
            <ThemedText numberOfLines={1} style={styles.editBannerHint}>
              Send to save your changes
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Stop editing"
            hitSlop={8}
            onPress={onCancelEdit}
            style={({ pressed }) => [styles.editBannerClose, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={15}
              tintColor={styles.editBannerHint.color}
            />
          </Pressable>
        </View>
      ) : null}
      <InputToolbar
        {...props}
        containerStyle={[
          styles.inputToolbar,
          isEditing && styles.inputToolbarJoined,
          { paddingBottom: Math.max(insets.bottom, 8) },
        ]}
        primaryStyle={styles.inputPrimary}
      />
    </View>
  );
}

type ChatSendProps = SendProps<GiftedMessage> & {
  isEditing?: boolean;
  onSubmitEdit?: (text: string) => void;
};

export function ChatSend({ isEditing, onSubmitEdit, ...props }: ChatSendProps) {
  const styles = useChatStyles();
  const text = props.text ?? '';
  const isDisabled = !text.trim();
  const icon = (
    <View style={[styles.sendButton, isDisabled && styles.sendButtonDisabled]}>
      <SymbolView
        name={{ ios: 'arrow.up', android: 'arrow_upward', web: 'arrow_upward' }}
        size={20}
        weight="bold"
        tintColor="#FFFFFF"
      />
    </View>
  );

  // Saving an edit deliberately bypasses Gifted Chat's send: it always scrolls the thread to the
  // newest message afterwards, which would throw the reader away from the message being edited.
  if (isEditing)
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Save changes"
        disabled={isDisabled}
        onPress={() => onSubmitEdit?.(text)}
        style={styles.sendContainer}>
        {icon}
      </Pressable>
    );

  return (
    <Send {...props} containerStyle={styles.sendContainer}>
      {icon}
    </Send>
  );
}
