import * as Haptics from 'expo-haptics';
import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { pinMessage, unpinMessage } from '../api';
import { replacePinnedMessagesInWindows } from '../utils/conversation-cache';
import i18n from '@/shared/i18n';

type TogglePinVariables = {
  messageId: string;
  pinned: boolean;
};

export function useChatPins(conversationId?: string) {
  const mutation = useMutation({
    mutationFn: ({ messageId, pinned }: TogglePinVariables) => {
      if (!conversationId) throw new Error(i18n.t('chat:errors.pinWithoutConversation'));
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
        i18n.t('chat:pinned.title'),
        error instanceof Error ? error.message : i18n.t('chat:errors.pinFailed'),
      );
    },
  });

  return {
    isPending: mutation.isPending,
    togglePin: mutation.mutate,
  };
}
