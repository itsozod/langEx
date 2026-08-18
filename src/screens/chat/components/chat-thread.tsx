import * as Haptics from 'expo-haptics';
import { View } from 'react-native';
import { GiftedChat, type ReplyMessage } from 'react-native-gifted-chat';

import type { AppTheme } from '@/providers/theme-provider';
import type { AuthUser } from '@/screens/auth/types';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { ChatInputToolbar, ChatSend } from './chat-composer';
import { ChatMessage, ReplySwipeAction } from './chat-message';
import { ChatReplyPreview } from './chat-reply-preview';
import { OlderMessagesLoader } from './older-messages-loader';
import { CHAT_HEADER_HEIGHT } from '../constants';
import { useChatStyles } from '../styles/chat-styles';
import type { GiftedMessage } from '../types';

type ChatThreadProps = {
  currentUser: AuthUser | null;
  giftedMessages: GiftedMessage[];
  hasNextPage: boolean;
  isFetchNextPageError: boolean;
  isFetchingNextPage: boolean;
  onInputChange: (text: string) => void;
  onLoadOlderMessages: () => void;
  onSend: (messages: GiftedMessage[]) => void;
  replyingTo: ReplyMessage | null;
  setReplyingTo: (message: ReplyMessage | null) => void;
  theme: AppTheme;
  topInset: number;
  typingUsers: string[];
};

export function ChatThread({
  currentUser,
  giftedMessages,
  hasNextPage,
  isFetchNextPageError,
  isFetchingNextPage,
  onInputChange,
  onLoadOlderMessages,
  onSend,
  replyingTo,
  setReplyingTo,
  theme,
  topInset,
  typingUsers,
}: ChatThreadProps) {
  const styles = useChatStyles();
  const currentUserId = currentUser?.id;

  return (
    <View style={styles.chat}>
      <GiftedChat<GiftedMessage>
        messages={giftedMessages}
        onSend={onSend}
        user={{
          _id: currentUserId ?? '',
          name: currentUser?.displayName || currentUser?.email || 'You',
          avatar: currentUser?.avatarUrl || undefined,
        }}
        colorScheme={theme}
        isTyping={typingUsers.length > 0}
        isSendButtonAlwaysVisible
        isDayAnimationEnabled={false}
        renderAvatar={null}
        renderMessage={(props) => <ChatMessage {...props} />}
        renderInputToolbar={(props) => <ChatInputToolbar {...props} />}
        renderSend={(props) => <ChatSend {...props} />}
        renderTypingIndicator={() =>
          typingUsers.length ? <ThemedText style={styles.typingText}>typing...</ThemedText> : null
        }
        renderChatEmpty={() => (
          <View style={styles.emptyChat}>
            <ThemedText type="bold" style={styles.emptyTitle}>
              Say hello 👋
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.emptyMessage}>
              Send the first message to start your conversation.
            </ThemedText>
          </View>
        )}
        loadEarlierMessagesProps={{
          isAvailable: hasNextPage,
          isLoading: isFetchingNextPage,
          isInfiniteScrollEnabled: true,
          onPress: onLoadOlderMessages,
        }}
        renderLoadEarlier={(props) => (
          <OlderMessagesLoader {...props} hasError={isFetchNextPageError} />
        )}
        reply={{
          message: replyingTo,
          onClear: () => setReplyingTo(null),
          renderPreview: (props) => <ChatReplyPreview {...props} currentUserId={currentUserId} />,
          swipe: {
            isEnabled: true,
            direction: 'right',
            onSwipe: (message) => {
              if (message.pending) return;
              setReplyingTo({
                _id: message._id,
                text: message.text,
                user: message.user,
                image: message.image,
                audio: message.audio,
              });
              void Haptics.selectionAsync().catch(() => {});
            },
            renderAction: () => <ReplySwipeAction />,
          },
        }}
        messagesContainerStyle={styles.messagesContainer}
        listProps={{
          contentContainerStyle: styles.messageList,
          keyboardShouldPersistTaps: 'handled',
          maintainVisibleContentPosition: { minIndexForVisible: 0 },
        }}
        keyboardAvoidingViewProps={{
          automaticOffset: false,
          keyboardVerticalOffset: topInset + CHAT_HEADER_HEIGHT,
        }}
        textInputProps={{
          onChangeText: onInputChange,
          placeholder: 'Write a message…',
          placeholderTextColor: styles.placeholder.color,
          style: styles.composer,
          multiline: true,
        }}
      />
    </View>
  );
}
