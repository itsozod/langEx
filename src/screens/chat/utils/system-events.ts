import type { MessageSystemEvent } from '../types/message.types';
import i18n from '@/shared/i18n';

function eventUserName(
  user: MessageSystemEvent['actor'],
  currentUserId: string | undefined,
  fallback: string,
  currentUserLabel: string,
) {
  if (user.id === currentUserId) return currentUserLabel;
  return user.displayName?.trim() || (user.isDeleted ? i18n.t('common:deletedUser') : fallback);
}

export function formatMessageSystemEvent(
  event: MessageSystemEvent | null | undefined,
  currentUserId?: string,
) {
  if (!event) return '';

  switch (event.type) {
    case 'GROUP_MEMBER_ADDED': {
      const actor = eventUserName(
        event.actor,
        currentUserId,
        i18n.t('chat:system.someone'),
        i18n.t('chat:you'),
      );
      const subject = eventUserName(
        event.subject,
        currentUserId,
        i18n.t('chat:system.aMember'),
        i18n.t('chat:system.youObject'),
      );
      return i18n.t('chat:system.memberAdded', { actor, subject });
    }
  }
}
