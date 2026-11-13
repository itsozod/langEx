import type { MessageSystemEvent } from '../types/message.types';

function eventUserName(
  user: MessageSystemEvent['actor'],
  currentUserId?: string,
  fallback = 'Someone',
  currentUserLabel = 'You',
) {
  if (user.id === currentUserId) return currentUserLabel;
  return user.displayName?.trim() || (user.isDeleted ? 'Deleted user' : fallback);
}

export function formatMessageSystemEvent(
  event: MessageSystemEvent | null | undefined,
  currentUserId?: string,
) {
  if (!event) return '';

  switch (event.type) {
    case 'GROUP_MEMBER_ADDED': {
      const actor = eventUserName(event.actor, currentUserId);
      const subject = eventUserName(event.subject, currentUserId, 'a member', 'you');
      return `${actor} added ${subject}`;
    }
  }
}
