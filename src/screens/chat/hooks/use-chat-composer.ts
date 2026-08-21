import { useCallback } from 'react';
import { Platform } from 'react-native';

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
  const {
    composerHeight,
    handleContentSizeChange: handleMeasuredContentSizeChange,
    isComposerScrollable,
    prepareComposerHeight,
    resetComposerHeight,
  } = useChatComposerHeight();

  const handleContentSizeChange = useCallback(
    (event: Parameters<typeof handleMeasuredContentSizeChange>[0]) => {
      // Edit mode is pre-sized before its text mounts. Letting Android replace that estimate with
      // a native measurement one frame later produces a visible small-to-large jump.
      if (Platform.OS === 'android' && editing) return;
      handleMeasuredContentSizeChange(event);
    },
    [editing, handleMeasuredContentSizeChange],
  );

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
      // Gifted Chat does not consistently report native content-size changes once an explicit
      // height is supplied, particularly on iOS. Keep growth responsive from the text itself;
      // `onContentSizeChange` can still correct the estimate when the platform emits it.
      // Android reports multiline content size reliably. Estimating here as well makes the
      // composer alternate between the estimated and measured heights on each keystroke.
      // iOS still needs the estimate because it can stop emitting content-size changes once an
      // explicit height has been supplied.
      if (Platform.OS === 'ios' || editing) prepareComposerHeight(text);
      onInputChange(text);
      handleComposerTextChange(text);
    },
    [editing, handleComposerTextChange, onInputChange, prepareComposerHeight],
  );

  return {
    composerHeight,
    composerText,
    editing,
    handleContentSizeChange,
    handleInputChange,
    handleSend,
    isComposerScrollable,
    startEditing: beginEditing,
    stopEditingAndResetComposer,
    submitEdit,
  };
}
