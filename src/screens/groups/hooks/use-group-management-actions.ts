import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import type { ChatParticipant } from '@/screens/chat/types/message.types';
import { useActionToast } from '@/shared/components/ui/action-toast-provider';

import { useManageGroup } from '../hooks';
import type { GroupManagementAction } from '../types';
import { useTranslation } from 'react-i18next';

type UseGroupManagementActionsOptions = {
  conversationId?: string;
  groupName?: string | null;
  member: ChatParticipant | null;
  onMemberActionComplete: () => void;
};

export function useGroupManagementActions({
  conversationId,
  groupName,
  member,
  onMemberActionComplete,
}: UseGroupManagementActionsOptions) {
  const mutation = useManageGroup();
  const { showToast } = useActionToast();
  const { t } = useTranslation(['groups', 'common']);
  const memberId = member?.id;
  const memberName = member?.displayName?.trim() || t('alerts.thisMember');
  const resolvedGroupName = groupName?.trim() || t('alerts.thisGroup');

  const promote = useCallback(() => {
    if (!conversationId || !memberId || mutation.isPending) return;
    Alert.alert(
      t('alerts.promoteTitle', { name: memberName }),
      t('alerts.promoteMessage', { name: memberName, group: resolvedGroupName }),
      [
        { text: t('common:actions.cancel'), style: 'cancel' },
        {
          text: t('actions.makeAdmin'),
          onPress: () =>
            mutation.mutate(
              { type: 'promote-admin', conversationId, participantId: memberId },
              {
                onSuccess: () => {
                  onMemberActionComplete();
                  showToast({ message: t('feedback.adminAdded', { name: memberName }) });
                },
              },
            ),
        },
      ],
    );
  }, [
    conversationId,
    memberId,
    memberName,
    mutation,
    onMemberActionComplete,
    resolvedGroupName,
    showToast,
    t,
  ]);

  const revoke = useCallback(() => {
    if (!conversationId || !memberId || mutation.isPending) return;
    Alert.alert(
      t('alerts.revokeTitle', { name: memberName }),
      t('alerts.revokeMessage', { name: memberName, group: resolvedGroupName }),
      [
        { text: t('common:actions.cancel'), style: 'cancel' },
        {
          text: t('actions.removeAdmin'),
          onPress: () =>
            mutation.mutate(
              { type: 'revoke-admin', conversationId, participantId: memberId },
              {
                onSuccess: () => {
                  onMemberActionComplete();
                  showToast({ message: t('feedback.adminRemoved', { name: memberName }) });
                },
              },
            ),
        },
      ],
    );
  }, [
    conversationId,
    memberId,
    memberName,
    mutation,
    onMemberActionComplete,
    resolvedGroupName,
    showToast,
    t,
  ]);

  const transfer = useCallback(() => {
    if (!conversationId || !memberId || mutation.isPending) return;
    Alert.alert(
      t('alerts.transferTitle', { name: memberName }),
      t('alerts.transferMessage', { group: resolvedGroupName }),
      [
        { text: t('common:actions.cancel'), style: 'cancel' },
        {
          text: t('actions.transferOwnership'),
          onPress: () =>
            mutation.mutate(
              { type: 'transfer-owner', conversationId, ownerId: memberId },
              {
                onSuccess: () => {
                  onMemberActionComplete();
                  showToast({ message: t('feedback.ownerTransferred', { name: memberName }) });
                },
              },
            ),
        },
      ],
    );
  }, [
    conversationId,
    memberId,
    memberName,
    mutation,
    onMemberActionComplete,
    resolvedGroupName,
    showToast,
    t,
  ]);

  const remove = useCallback(() => {
    if (!conversationId || !memberId || mutation.isPending) return;
    Alert.alert(
      t('alerts.removeTitle', { name: memberName }),
      t('alerts.removeMessage', { name: memberName, group: resolvedGroupName }),
      [
        { text: t('common:actions.cancel'), style: 'cancel' },
        {
          text: t('actions.remove'),
          style: 'destructive',
          onPress: () =>
            mutation.mutate(
              { type: 'remove-member', conversationId, participantId: memberId },
              {
                onSuccess: () => {
                  onMemberActionComplete();
                  showToast({ message: t('feedback.memberRemoved', { name: memberName }) });
                },
              },
            ),
        },
      ],
    );
  }, [
    conversationId,
    memberId,
    memberName,
    mutation,
    onMemberActionComplete,
    resolvedGroupName,
    showToast,
    t,
  ]);

  const leave = useCallback(() => {
    if (!conversationId || mutation.isPending) return;
    Alert.alert(t('alerts.leaveTitle', { group: resolvedGroupName }), t('alerts.leaveMessage'), [
      { text: t('common:actions.cancel'), style: 'cancel' },
      {
        text: t('actions.leave'),
        style: 'destructive',
        onPress: () =>
          mutation.mutate(
            { type: 'leave-group', conversationId },
            {
              onSuccess: () => {
                showToast({ message: t('feedback.groupRemoved') });
                router.replace('/(tabs)/chats');
              },
            },
          ),
      },
    ]);
  }, [conversationId, mutation, resolvedGroupName, showToast, t]);

  const pendingAction: GroupManagementAction | undefined = mutation.isPending
    ? mutation.variables?.type === 'promote-admin'
      ? 'promote'
      : mutation.variables?.type === 'revoke-admin'
        ? 'revoke'
        : mutation.variables?.type === 'transfer-owner'
          ? 'transfer'
          : mutation.variables?.type === 'remove-member'
            ? 'remove'
            : undefined
    : undefined;
  const errorMessage = mutation.error instanceof Error ? mutation.error.message : undefined;

  return {
    errorMessage,
    isPending: mutation.isPending,
    leave,
    leaveErrorMessage: mutation.variables?.type === 'leave-group' ? errorMessage : undefined,
    pendingAction,
    promote,
    remove,
    reset: mutation.reset,
    revoke,
    transfer,
  };
}
