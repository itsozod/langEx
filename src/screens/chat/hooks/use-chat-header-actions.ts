import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import type { ChatParticipant } from '../types/message.types';
import {
  getActiveDeleteConversationVariables,
  useDeleteConversation,
} from './use-delete-conversation';

type UseChatHeaderActionsOptions = {
  conversationId?: string;
  conversationName?: string | null;
  isGroup: boolean;
  participant?: ChatParticipant;
  setSocketError: (message: string | null) => void;
};

export function useChatHeaderActions({
  conversationId,
  conversationName,
  isGroup,
  participant,
  setSocketError,
}: UseChatHeaderActionsOptions) {
  const deleteConversation = useDeleteConversation();
  const participantId = participant?.id;
  const participantName = participant?.displayName;

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/chats');
  }, []);

  const openDetails = useCallback(() => {
    if (isGroup && conversationId) {
      router.push({ pathname: '/group/[id]', params: { id: conversationId } });
      return;
    }
    if (!participantId) return;
    router.push({
      pathname: '/profile/[id]',
      params: conversationId
        ? { id: participantId, returnToConversationId: conversationId }
        : { id: participantId },
    });
  }, [conversationId, isGroup, participantId]);

  const confirmDelete = useCallback(() => {
    if (!conversationId || deleteConversation.isPending) return;
    const name = isGroup
      ? conversationName?.trim() || 'this group'
      : participantName?.trim() || 'this language partner';

    Alert.alert(
      isGroup ? `Delete ${name}?` : `Delete conversation with ${name}?`,
      isGroup
        ? 'This removes the group conversation from your account and can’t be undone. It does not remove other members.'
        : `This removes the conversation from your account and can’t be undone. It does not unsend messages from ${name}’s account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete conversation',
          style: 'destructive',
          onPress: () => {
            const variables = getActiveDeleteConversationVariables(conversationId);
            if (!variables) {
              setSocketError('Your account session changed. Open the conversation and try again.');
              return;
            }

            deleteConversation.mutate(variables, {
              onSuccess: () => {
                if (process.env.EXPO_OS === 'ios') {
                  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                router.replace('/(tabs)/chats');
              },
              onError: (error) => {
                if (process.env.EXPO_OS === 'ios') {
                  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                }
                setSocketError(
                  error instanceof Error
                    ? error.message
                    : 'Conversation could not be deleted. Try again.',
                );
              },
            });
          },
        },
      ],
    );
  }, [
    conversationId,
    conversationName,
    deleteConversation,
    isGroup,
    participantName,
    setSocketError,
  ]);

  return {
    confirmDelete,
    deletePending: deleteConversation.isPending,
    goBack,
    openDetails,
  };
}
