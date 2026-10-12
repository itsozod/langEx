import * as Haptics from 'expo-haptics';
import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { pinMessage, unpinMessage } from '../api';
import { replacePinnedMessagesInWindows } from '../utils/conversation-cache';

type TogglePinVariables = {
  messageId: string;
  pinned: boolean;
};

export function useChatPins(conversationId?: string) {
  const mutation = useMutation({
    mutationFn: ({ messageId, pinned }: TogglePinVariables) => {
      if (!conversationId) throw new Error('Open the conversation before pinning a message.');
      return pinned
        ? unpinMessage(conversationId, messageId)
        : pinMessage(conversationId, messageId);
    },
    onSuccess: ({ pinnedMessages }) => {
      replacePinnedMessagesInWindows(conversationId, pinnedMessages);
      void Haptics.selectionAsync().catch(() => {});
    },
    onError: (error) => {
      Alert.alert(
        'Pinned messages',
        error instanceof Error ? error.message : 'The pinned message could not be updated.',
      );
    },
  });

  return {
    isPending: mutation.isPending,
    togglePin: mutation.mutate,
  };
}
