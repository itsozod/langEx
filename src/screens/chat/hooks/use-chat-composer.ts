import { useCallback } from 'react';

import type { GiftedMessage } from '../types';
import { useChatComposerHeight } from './use-chat-composer-height';
import { useChatEdit } from './use-chat-edit';

type UseChatComposerOptions = {
  isHistoricalWindow: boolean;
  onEditMessage: (messageId: string, content: string) => void;
  onInputChange: (text: string) => void;
  onJumpToLatest: () => void;
  onSend: (messages: GiftedMessage[]) => void;
  scrollToLatestAfterSend: () => void;
};

export function useChatComposer({
  isHistoricalWindow,
  onEditMessage,
  onInputChange,
  onJumpToLatest,
  onSend,
  scrollToLatestAfterSend,
}: UseChatComposerOptions) {
  const { composerText, editing, handleComposerTextChange, startEditing, stopEditing } =
    useChatEdit();
  const { composerHeight, handleContentSizeChange, prepareComposerHeight, resetComposerHeight } =
    useChatComposerHeight();

  const beginEditing = useCallback(
    (message: GiftedMessage) => {
      // React batches these updates, so the controlled edit text first appears at its estimated
      // multiline height instead of flashing at one line while native measurement catches up.
      prepareComposerHeight(message.text);
      startEditing(message);
    },
    [prepareComposerHeight, startEditing],
  );

  const stopEditingAndResetComposer = useCallback(() => {
    stopEditing();
    resetComposerHeight();
  }, [resetComposerHeight, stopEditing]);

  const handleSend = useCallback(
    (messages: GiftedMessage[]) => {
      if (isHistoricalWindow) onJumpToLatest();
      onSend(messages);
      resetComposerHeight();
      scrollToLatestAfterSend();
    },
    [isHistoricalWindow, onJumpToLatest, onSend, resetComposerHeight, scrollToLatestAfterSend],
  );

  const submitEdit = useCallback(
    (text: string) => {
      if (!editing) return;

      const { id } = editing;
      stopEditingAndResetComposer();
      onInputChange('');
      onEditMessage(id, text);
    },
    [editing, onEditMessage, onInputChange, stopEditingAndResetComposer],
  );

  const handleInputChange = useCallback(
    (text: string) => {
      onInputChange(text);
      handleComposerTextChange(text);
    },
    [handleComposerTextChange, onInputChange],
  );

  return {
    composerHeight,
    composerText,
    editing,
    handleContentSizeChange,
    handleInputChange,
    handleSend,
    startEditing: beginEditing,
    stopEditingAndResetComposer,
    submitEdit,
  };
}
