import { useRef } from 'react';
import { Pressable, View } from 'react-native';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';
import type { SearchBarRect } from '@/shared/hooks/use-search-overlay-transition';

import { useSearchOverlayStyles } from './search-overlay-styles';

type SearchTriggerProps = {
  accessibilityHint: string;
  accessibilityLabel: string;
  /** Hidden while its full-screen search is open, so only the rising bar is visible. */
  hidden?: boolean;
  onOpen: (origin: SearchBarRect | null) => void;
  placeholder: string;
};

/** Looks exactly like the search field so the full-screen bar appears to rise out of it. */
export function SearchTrigger({
  accessibilityHint,
  accessibilityLabel,
  hidden = false,
  onOpen,
  placeholder,
}: SearchTriggerProps) {
  const styles = useSearchOverlayStyles();
  const ref = useRef<View>(null);

  const open = () => {
    const node = ref.current;
    if (!node) {
      onOpen(null);
      return;
    }
    node.measureInWindow((x, y, width, height) => {
      onOpen(width > 0 ? { x, y, width, height } : null);
    });
  };

  return (
    <Pressable
      ref={ref}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="search"
      onPress={open}
      style={[styles.field, hidden && styles.hidden]}>
      <SymbolView
        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
        size={19}
        weight="medium"
        tintColor={styles.fieldIcon.color}
      />
      <ThemedText numberOfLines={1} style={[styles.input, styles.placeholder]}>
        {placeholder}
      </ThemedText>
    </Pressable>
  );
}
