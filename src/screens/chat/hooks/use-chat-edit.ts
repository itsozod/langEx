import { useCallback, useEffect, useRef, useState } from 'react';

import type { GiftedMessage } from '../types';

type EditingMessage = { id: string; originalText: string };

/**
 * Editing borrows the composer: the message text is loaded into it and sending applies the edit
 * instead of posting a new message.
 *
 * Gifted Chat's composer is uncontrolled until a `text` prop is supplied, and typing in an
 * uncontrolled composer never re-renders the thread. Control is therefore taken only for the
 * duration of an edit, and handed back through one empty render so the composer is left cleared
 * rather than holding the text that was just submitted.
 */
export function useChatEdit() {
  const [editing, setEditing] = useState<EditingMessage | null>(null);
  const [composerText, setComposerText] = useState<string | undefined>(undefined);
  const releaseFrameRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  useEffect(
    () => () => {
      if (releaseFrameRef.current !== null) cancelAnimationFrame(releaseFrameRef.current);
    },
    [],
  );

  const startEditing = useCallback((message: GiftedMessage) => {
    setEditing({ id: String(message._id), originalText: message.text });
    setComposerText(message.text);
  }, []);

  const stopEditing = useCallback(() => {
    setEditing(null);
    // Empty while still controlled, so the composer syncs to empty before control is released.
    setComposerText('');
    releaseFrameRef.current = requestAnimationFrame(() => setComposerText(undefined));
  }, []);

  const handleComposerTextChange = useCallback((text: string) => {
    setComposerText((current) => (current === undefined ? current : text));
  }, []);

  return {
    composerText,
    editing,
    handleComposerTextChange,
    startEditing,
    stopEditing,
  };
}
