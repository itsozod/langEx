import { View } from 'react-native';
import {
  InputToolbar,
  Send,
  type InputToolbarProps,
  type SendProps,
} from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SymbolView } from '@/shared/components/ui/symbol-view';

import { useChatStyles } from '../styles/chat-styles';
import type { GiftedMessage } from '../types';

export function ChatInputToolbar(props: InputToolbarProps<GiftedMessage>) {
  const styles = useChatStyles();
  const insets = useSafeAreaInsets();

  return (
    <InputToolbar
      {...props}
      containerStyle={[styles.inputToolbar, { paddingBottom: Math.max(insets.bottom, 8) }]}
      primaryStyle={styles.inputPrimary}
    />
  );
}

export function ChatSend(props: SendProps<GiftedMessage>) {
  const styles = useChatStyles();

  return (
    <Send {...props} containerStyle={styles.sendContainer}>
      <View style={[styles.sendButton, !props.text?.trim() && styles.sendButtonDisabled]}>
        <SymbolView
          name={{ ios: 'arrow.up', android: 'arrow_upward', web: 'arrow_upward' }}
          size={20}
          weight="bold"
          tintColor="#FFFFFF"
        />
      </View>
    </Send>
  );
}
