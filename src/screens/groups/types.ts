import type { ChatParticipant, Conversation, Message } from '@/screens/chat/types/message.types';

export type GroupCandidate = ChatParticipant & {
  directConversationId: string;
};

export type GroupCandidatesResponse = {
  candidates: GroupCandidate[];
};

export type CreateGroupInput = {
  name: string;
  participantIds: string[];
};

export type CreateGroupResponse = {
  conversation: Conversation;
  systemMessages: Message[];
};

export type AddGroupParticipantsInput = {
  conversationId: string;
  participantIds: string[];
};

export type AddGroupParticipantsResponse = {
  conversation: Conversation;
  addedParticipantIds: string[];
  systemMessages: Message[];
};

export type GroupManagementInput =
  | { type: 'promote-admin'; conversationId: string; participantId: string }
  | { type: 'revoke-admin'; conversationId: string; participantId: string }
  | { type: 'transfer-owner'; conversationId: string; ownerId: string }
  | { type: 'remove-member'; conversationId: string; participantId: string }
  | { type: 'leave-group'; conversationId: string };

export type GroupManagementResponse = { conversation: Conversation } | { success: true };

export type GroupRole = 'owner' | 'admin' | 'member';

export type GroupManagementAction = 'profile' | 'promote' | 'revoke' | 'transfer' | 'remove';
