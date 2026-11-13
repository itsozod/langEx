import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import type { ChatParticipant } from '@/screens/chat/types/message.types';

import { useManageGroup } from '../hooks';
import type { GroupManagementAction } from '../types';

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
  const memberId = member?.id;
  const memberName = member?.displayName?.trim() || 'this member';
  const resolvedGroupName = groupName?.trim() || 'this group';

  const promote = useCallback(() => {
    if (!conversationId || !memberId || mutation.isPending) return;
    Alert.alert(
      `Make ${memberName} an admin?`,
      `${memberName} will be able to manage members in ${resolvedGroupName}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Make admin',
          onPress: () =>
            mutation.mutate(
              { type: 'promote-admin', conversationId, participantId: memberId },
              { onSuccess: onMemberActionComplete },
            ),
        },
      ],
    );
  }, [conversationId, memberId, memberName, mutation, onMemberActionComplete, resolvedGroupName]);

  const revoke = useCallback(() => {
    if (!conversationId || !memberId || mutation.isPending) return;
    Alert.alert(
      `Remove ${memberName} as an admin?`,
      `${memberName} will remain a member of ${resolvedGroupName}, but will no longer be able to manage members.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove admin role',
          onPress: () =>
            mutation.mutate(
              { type: 'revoke-admin', conversationId, participantId: memberId },
              { onSuccess: onMemberActionComplete },
            ),
        },
      ],
    );
  }, [conversationId, memberId, memberName, mutation, onMemberActionComplete, resolvedGroupName]);

  const transfer = useCallback(() => {
    if (!conversationId || !memberId || mutation.isPending) return;
    Alert.alert(
      `Make ${memberName} the owner?`,
      `You will become a regular member of ${resolvedGroupName}. The new owner can manage admins, while the owner and admins can add people.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer ownership',
          onPress: () =>
            mutation.mutate(
              { type: 'transfer-owner', conversationId, ownerId: memberId },
              { onSuccess: onMemberActionComplete },
            ),
        },
      ],
    );
  }, [conversationId, memberId, memberName, mutation, onMemberActionComplete, resolvedGroupName]);

  const remove = useCallback(() => {
    if (!conversationId || !memberId || mutation.isPending) return;
    Alert.alert(
      `Remove ${memberName}?`,
      `${memberName} will immediately lose access to ${resolvedGroupName}. If invited again, they will only see new messages.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            mutation.mutate(
              { type: 'remove-member', conversationId, participantId: memberId },
              { onSuccess: onMemberActionComplete },
            ),
        },
      ],
    );
  }, [conversationId, memberId, memberName, mutation, onMemberActionComplete, resolvedGroupName]);

  const leave = useCallback(() => {
    if (!conversationId || mutation.isPending) return;
    Alert.alert(
      `Leave ${resolvedGroupName}?`,
      'You will immediately lose access. If you are invited again, you will only see messages sent after you rejoin.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave group',
          style: 'destructive',
          onPress: () =>
            mutation.mutate(
              { type: 'leave-group', conversationId },
              { onSuccess: () => router.replace('/(tabs)/chats') },
            ),
        },
      ],
    );
  }, [conversationId, mutation, resolvedGroupName]);

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
