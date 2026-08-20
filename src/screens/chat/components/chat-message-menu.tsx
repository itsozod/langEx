import { Modal, Pressable, useWindowDimensions, View } from 'react-native';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useChatStyles } from '../styles/chat-styles';
import type { GiftedMessage } from '../types';
import { findMessageLinks } from '../utils/links';
import type { MessageAnchor } from './chat-message';

const MENU_WIDTH = 208;
const MENU_ITEM_HEIGHT = 50;
const SCREEN_MARGIN = 12;
const ANCHOR_GAP = 8;
/** More than a few rows turns the menu into a wall; the whole message is still one tap away. */
const MAX_LINK_ROWS = 3;

export type MessageMenuTarget = {
  anchor: MessageAnchor;
  isOwnMessage: boolean;
  message: GiftedMessage;
};

type ChatMessageMenuProps = {
  onClose: () => void;
  onCopy: (message: GiftedMessage) => void;
  onCopyLink: (url: string) => void;
  onEdit: (message: GiftedMessage) => void;
  onReply: (message: GiftedMessage) => void;
  onUnsend: (message: GiftedMessage) => void;
  target: MessageMenuTarget | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** The long-press menu, placed against the bubble it belongs to rather than at a fixed spot. */
export function ChatMessageMenu({
  onClose,
  onCopy,
  onCopyLink,
  onEdit,
  onReply,
  onUnsend,
  target,
}: ChatMessageMenuProps) {
  const styles = useChatStyles();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  if (!target) return null;

  const { anchor, isOwnMessage, message } = target;
  // A link that is the entire message would make its row a second copy of Copy.
  const messageText = message.text.trim();
  const links = findMessageLinks(message.text)
    .filter((link) => link.text !== messageText)
    .slice(0, MAX_LINK_ROWS);
  // Only the sender can edit or unsend, and the server enforces it regardless of what is offered.
  const canChange = isOwnMessage;
  const menuHeight = (2 + links.length + (canChange ? 2 : 0)) * MENU_ITEM_HEIGHT;
  const belowTop = anchor.y + anchor.height + ANCHOR_GAP;
  const fitsBelow = belowTop + menuHeight <= screenHeight - SCREEN_MARGIN;
  const top = fitsBelow ? belowTop : Math.max(anchor.y - menuHeight - ANCHOR_GAP, SCREEN_MARGIN);
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
        {links.map((link) => (
          <View key={link.url}>
            <View style={styles.menuDivider} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Copy the link ${link.url}`}
              onPress={() => onCopyLink(link.url)}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
              <SymbolView
                name={{ ios: 'link', android: 'link', web: 'link' }}
                size={18}
                tintColor={styles.menuIcon.color}
              />
              <ThemedText numberOfLines={1} style={styles.menuLabel}>
                {links.length > 1 ? `Copy ${link.label}` : 'Copy link'}
              </ThemedText>
            </Pressable>
          </View>
        ))}
        {canChange ? (
          <View>
            <View style={styles.menuDivider} />
            <Pressable
              accessibilityRole="button"
              onPress={() => onEdit(message)}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
              <SymbolView
                name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
                size={18}
                tintColor={styles.menuIcon.color}
              />
              <ThemedText style={styles.menuLabel}>Edit</ThemedText>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              accessibilityRole="button"
              onPress={() => onUnsend(message)}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
              <SymbolView
                name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                size={18}
                tintColor={styles.menuIconDestructive.color}
              />
              <ThemedText style={[styles.menuLabel, styles.menuLabelDestructive]}>
                Unsend
              </ThemedText>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
