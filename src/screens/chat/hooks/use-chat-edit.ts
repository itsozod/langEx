import { useCallback, useState } from 'react';

import type { GiftedMessage } from '../types/message.types';

type EditingMessage = { id: string; originalText: string };

/** Owns the controlled composer text and the optional message currently being edited. */
export function useChatEdit() {
  const [editing, setEditing] = useState<EditingMessage | null>(null);
  const [composerText, setComposerText] = useState('');

  const startEditing = useCallback((message: GiftedMessage) => {
    setEditing({ id: String(message._id), originalText: message.text });
    setComposerText(message.text);
  }, []);

  const stopEditing = useCallback(() => {
    setEditing(null);
    setComposerText('');
  }, []);

  const handleComposerTextChange = useCallback((text: string) => setComposerText(text), []);

  return {
    composerText,
    editing,
    handleComposerTextChange,
    startEditing,
    stopEditing,
  };
}
