import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { Alert, Clipboard } from 'react-native';
import type { ReplyMessage } from 'react-native-gifted-chat';

import type { MessageAnchor } from '../components/chat-message';
import type { MessageMenuTarget } from '../components/chat-message-menu';
import type { GiftedMessage } from '../types/message.types';

type UseChatMessageActionsOptions = {
  currentUserId?: string;
  onUnsendMessage: (messageId: string) => void;
  setReplyingTo: (message: ReplyMessage | null) => void;
  startEditing: (message: GiftedMessage) => void;
  stopEditingAndResetComposer: () => void;
};

export function useChatMessageActions({
  currentUserId,
  onUnsendMessage,
  setReplyingTo,
  startEditing,
  stopEditingAndResetComposer,
}: UseChatMessageActionsOptions) {
  const [menuTarget, setMenuTarget] = useState<MessageMenuTarget | null>(null);

  const startReply = useCallback(
    (message: GiftedMessage) => {
      if (message.pending) return;
      stopEditingAndResetComposer();
      setReplyingTo({
        _id: message._id,
        text: message.text,
        user: message.user,
        image: message.image,
        audio: message.audio,
      });
      void Haptics.selectionAsync().catch(() => {});
    },
    [setReplyingTo, stopEditingAndResetComposer],
  );

  const openMessageMenu = useCallback(
    (message: GiftedMessage, anchor: MessageAnchor) => {
      setMenuTarget({
        anchor,
        isOwnMessage: String(message.user._id) === String(currentUserId),
        message,
      });
    },
    [currentUserId],
  );
  const closeMessageMenu = useCallback(() => setMenuTarget(null), []);
  const replyFromMenu = useCallback(
    (message: GiftedMessage) => {
      setMenuTarget(null);
      startReply(message);
    },
    [startReply],
  );
  const copyFromMenu = useCallback((message: GiftedMessage) => {
    setMenuTarget(null);
    Clipboard.setString(message.text);
  }, []);
  const copyLinkFromMenu = useCallback((url: string) => {
    setMenuTarget(null);
    Clipboard.setString(url);
  }, []);
  const editFromMenu = useCallback(
    (message: GiftedMessage) => {
      setMenuTarget(null);
      setReplyingTo(null);
      startEditing(message);
    },
    [setReplyingTo, startEditing],
  );
  const unsendFromMenu = useCallback(
    (message: GiftedMessage) => {
      setMenuTarget(null);
      Alert.alert('Unsend message?', 'This removes it for everyone in the chat.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unsend',
          style: 'destructive',
          onPress: () => onUnsendMessage(String(message._id)),
        },
      ]);
    },
    [onUnsendMessage],
  );

  return {
    closeMessageMenu,
    copyFromMenu,
    copyLinkFromMenu,
    editFromMenu,
    menuTarget,
    openMessageMenu,
    replyFromMenu,
    startReply,
    unsendFromMenu,
  };
}
