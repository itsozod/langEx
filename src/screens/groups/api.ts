import { apiRequest } from '@/shared/lib/api-client';

import type {
  AddGroupParticipantsInput,
  AddGroupParticipantsResponse,
  CreateGroupInput,
  CreateGroupResponse,
  GroupCandidatesResponse,
  GroupManagementInput,
  GroupManagementResponse,
} from './types';

export function getGroupCandidates() {
  return apiRequest<GroupCandidatesResponse>('/conversations/group-candidates');
}

export function createGroup(input: CreateGroupInput) {
  return apiRequest<CreateGroupResponse>('/conversations/groups', {
    method: 'POST',
    body: input,
  });
}

export function addGroupParticipants({
  conversationId,
  participantIds,
}: AddGroupParticipantsInput) {
  return apiRequest<AddGroupParticipantsResponse>(
    `/conversations/${encodeURIComponent(conversationId)}/participants`,
    { method: 'POST', body: { participantIds } },
  );
}

export function manageGroup(input: GroupManagementInput) {
  const conversationPath = `/conversations/${encodeURIComponent(input.conversationId)}`;

  switch (input.type) {
    case 'promote-admin':
      return apiRequest<GroupManagementResponse>(`${conversationPath}/admins`, {
        method: 'POST',
        body: { participantId: input.participantId },
      });
    case 'revoke-admin':
      return apiRequest<GroupManagementResponse>(
        `${conversationPath}/admins/${encodeURIComponent(input.participantId)}`,
        { method: 'DELETE' },
      );
    case 'transfer-owner':
      return apiRequest<GroupManagementResponse>(`${conversationPath}/owner`, {
        method: 'PATCH',
        body: { ownerId: input.ownerId },
      });
    case 'remove-member':
      return apiRequest<GroupManagementResponse>(
        `${conversationPath}/participants/${encodeURIComponent(input.participantId)}`,
        { method: 'DELETE' },
      );
    case 'leave-group':
      return apiRequest<GroupManagementResponse>(`${conversationPath}/participants/me`, {
        method: 'DELETE',
      });
  }
}
