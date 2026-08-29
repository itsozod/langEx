import { useEffect } from 'react';
import type { ReplyMessage } from 'react-native-gifted-chat';

type UseChatReadOnlyOptions = {
  closeMessageMenu: () => void;
  isReadOnly: boolean;
  setReplyingTo: (message: ReplyMessage | null) => void;
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
