import { ActivityIndicator, Pressable, View } from 'react-native';

import { SymbolView, type SymbolViewProps } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useSearchOverlayStyles } from './search-overlay-styles';

type SearchStateProps = {
  actionLabel?: string;
  icon: SymbolViewProps['name'];
  message: string;
  onAction?: () => void;
  title: string;
};

/** Centered idle, empty, or error message inside a full-screen search. */
export function SearchState({ actionLabel, icon, message, onAction, title }: SearchStateProps) {
  const styles = useSearchOverlayStyles();

  return (
    <View style={styles.state}>
      <View style={styles.stateIcon}>
        <SymbolView name={icon} size={26} tintColor={styles.stateIconColor.color} />
      </View>
      <ThemedText type="bold" style={styles.stateTitle}>
        {title}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.stateMessage}>
        {message}
      </ThemedText>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.cancelButton}>
          <ThemedText style={styles.cancelText}>{actionLabel}</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function SearchLoadingState() {
  const styles = useSearchOverlayStyles();

  return (
    <View style={styles.state}>
      <ActivityIndicator color={styles.stateIconColor.color} />
    </View>
  );
}
