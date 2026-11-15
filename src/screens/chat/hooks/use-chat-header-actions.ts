import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import type { ChatParticipant } from '../types/message.types';
import {
  getActiveDeleteConversationVariables,
  useDeleteConversation,
} from './use-delete-conversation';
import i18n from '@/shared/i18n';

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
      ? conversationName?.trim() || i18n.t('groups:alerts.thisGroup')
      : participantName?.trim() || i18n.t('chat:deleteConversation.thisPartner');

    Alert.alert(
      isGroup
        ? i18n.t('chat:deleteConversation.groupTitle', { name })
        : i18n.t('chat:deleteConversation.directTitle', { name }),
      isGroup
        ? i18n.t('chat:deleteConversation.groupMessage')
        : i18n.t('chat:deleteConversation.directMessage', { name }),
      [
        { text: i18n.t('common:actions.cancel'), style: 'cancel' },
        {
          text: i18n.t('chat:deleteConversation.action'),
          style: 'destructive',
          onPress: () => {
            const variables = getActiveDeleteConversationVariables(conversationId);
            if (!variables) {
              setSocketError(i18n.t('chat:errors.sessionChanged'));
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
                  error instanceof Error ? error.message : i18n.t('chat:errors.deleteFailed'),
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
