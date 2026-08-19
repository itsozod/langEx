import { Modal, Pressable, useWindowDimensions, View } from 'react-native';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatStyles } from '../styles/chat-styles';
import type { GiftedMessage } from '../types';
import type { MessageAnchor } from './chat-message';

const MENU_WIDTH = 184;
const MENU_HEIGHT = 100;
const SCREEN_MARGIN = 12;
const ANCHOR_GAP = 8;

export type MessageMenuTarget = {
  anchor: MessageAnchor;
  isOwnMessage: boolean;
  message: GiftedMessage;
};

type ChatMessageMenuProps = {
  onClose: () => void;
  onCopy: (message: GiftedMessage) => void;
  onReply: (message: GiftedMessage) => void;
  target: MessageMenuTarget | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** The long-press menu, placed against the bubble it belongs to rather than at a fixed spot. */
export function ChatMessageMenu({ onClose, onCopy, onReply, target }: ChatMessageMenuProps) {
  const styles = useChatStyles();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  if (!target) return null;

  const { anchor, isOwnMessage, message } = target;
  const belowTop = anchor.y + anchor.height + ANCHOR_GAP;
  const fitsBelow = belowTop + MENU_HEIGHT <= screenHeight - SCREEN_MARGIN;
  const top = fitsBelow ? belowTop : Math.max(anchor.y - MENU_HEIGHT - ANCHOR_GAP, SCREEN_MARGIN);
  const preferredLeft = isOwnMessage ? anchor.x + anchor.width - MENU_WIDTH : anchor.x;
  const left = clamp(preferredLeft, SCREEN_MARGIN, screenWidth - MENU_WIDTH - SCREEN_MARGIN);

  return (
    <Modal transparent statusBarTranslucent animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close menu" style={styles.menuBackdrop} onPress={onClose} />
      <View style={[styles.menuCard, { top, left, width: MENU_WIDTH }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onReply(message)}
          style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
          <SymbolView
            name={{ ios: 'arrowshape.turn.up.left', android: 'reply', web: 'reply' }}
            size={18}
            tintColor={styles.menuIcon.color}
          />
          <ThemedText style={styles.menuLabel}>Reply</ThemedText>
        </Pressable>
        <View style={styles.menuDivider} />
        <Pressable
          accessibilityRole="button"
          onPress={() => onCopy(message)}
          style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
          <SymbolView
            name={{ ios: 'doc.on.doc', android: 'content_copy', web: 'content_copy' }}
            size={18}
            tintColor={styles.menuIcon.color}
          />
          <ThemedText style={styles.menuLabel}>Copy</ThemedText>
        </Pressable>
      </View>
    </Modal>
  );
}
