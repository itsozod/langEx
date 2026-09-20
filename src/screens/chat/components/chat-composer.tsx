import { Pressable, View, type TextInputProps } from 'react-native';
import { Composer } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatStyles } from '../styles/chat-styles';
import type { GiftedReplyMessage } from '../types/message.types';
import { ChatReplyPreview } from './chat-reply-preview';

type ChatInputToolbarProps = {
  currentUserId?: string;
  isEditing?: boolean;
  onCancelEdit?: () => void;
  onClearReply: () => void;
  onChooseImages?: () => void;
  onSendText: (text: string) => void;
  onSubmitEdit: (text: string) => void;
  replyMessage: GiftedReplyMessage | null;
  text: string;
  textInputProps: Partial<TextInputProps>;
};

export function ChatInputToolbar({
  isEditing,
  onCancelEdit,
  onClearReply,
  onChooseImages,
  onSendText,
  onSubmitEdit,
  replyMessage,
  text,
  textInputProps,
  currentUserId,
}: ChatInputToolbarProps) {
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
      <View
        style={[
          styles.inputToolbar,
          isEditing && styles.inputToolbarJoined,
          { paddingBottom: Math.max(insets.bottom, 8) },
        ]}>
        {replyMessage ? (
          <ChatReplyPreview
            currentUserId={currentUserId}
            onClearReply={onClearReply}
            replyMessage={replyMessage}
          />
        ) : null}
        <View style={styles.inputPrimary}>
          {!isEditing && onChooseImages ? <ChatImageAction onPress={onChooseImages} /> : null}
          <Composer text={text} textInputProps={textInputProps} />
          <ChatSend
            isEditing={isEditing}
            onSendText={onSendText}
            onSubmitEdit={onSubmitEdit}
            text={text}
          />
        </View>
      </View>
    </View>
  );
}

function ChatImageAction({ onPress }: { onPress: () => void }) {
  const styles = useChatStyles();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Choose up to four photos"
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [styles.imageAction, pressed && styles.pressed]}>
      <SymbolView
        name={{ ios: 'photo', android: 'image', web: 'image' }}
        size={21}
        tintColor={styles.imageActionIcon.color}
      />
    </Pressable>
  );
}

type ChatSendProps = {
  isEditing?: boolean;
  onSendText: (text: string) => void;
  onSubmitEdit?: (text: string) => void;
  text: string;
};

export function ChatSend({ isEditing, onSendText, onSubmitEdit, text }: ChatSendProps) {
  const styles = useChatStyles();
  const trimmedText = text.trim();
  const isDisabled = !trimmedText;
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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Send message"
      disabled={isDisabled}
      onPress={() => onSendText(trimmedText)}
      style={({ pressed }) => [styles.sendContainer, pressed && styles.pressed]}>
      {icon}
    </Pressable>
  );
}
