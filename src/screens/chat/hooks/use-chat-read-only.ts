import { useEffect } from 'react';

import type { GiftedReplyMessage } from '../types/message.types';

type UseChatReadOnlyOptions = {
  closeMessageMenu: () => void;
  isReadOnly: boolean;
  setReplyingTo: (message: GiftedReplyMessage | null) => void;
  stopEditing: () => void;
};

export function useChatReadOnly({
  closeMessageMenu,
  isReadOnly,
  setReplyingTo,
  stopEditing,
}: UseChatReadOnlyOptions) {
  useEffect(() => {
    if (!isReadOnly) return;
    closeMessageMenu();
    setReplyingTo(null);
    stopEditing();
  }, [closeMessageMenu, isReadOnly, setReplyingTo, stopEditing]);
}
