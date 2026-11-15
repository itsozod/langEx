import type { ComponentProps } from 'react';
import { KeyboardChatScrollView } from 'react-native-keyboard-controller';

import { useComposerKeyboardOffset } from '../hooks/use-composer-keyboard-offset';

type ChatKeyboardScrollViewProps = ComponentProps<typeof KeyboardChatScrollView>;

/**
 * FlashList's scroll component for the message thread. When the keyboard opens it lifts the
 * messages in step with the keyboard through content insets instead of resizing the list, so the
 * conversation stays exactly where it was (no auto-scroll jump) and nothing has to be measured.
 */
export function ChatKeyboardScrollView(props: ChatKeyboardScrollViewProps) {
  const offset = useComposerKeyboardOffset();
  return <KeyboardChatScrollView {...props} offset={offset} />;
}
