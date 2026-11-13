import { ActivityIndicator, Pressable, View } from 'react-native';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { useGroupStyles } from '../styles/group-styles';

type GroupScreenHeaderProps = {
  actionLabel?: string;
  actionDisabled?: boolean;
  actionPending?: boolean;
  onAction?: () => void;
  onBack: () => void;
  title: string;
};

export function GroupScreenHeader({
  actionLabel,
  actionDisabled,
  actionPending,
  onAction,
  onBack,
  title,
}: GroupScreenHeaderProps) {
  const styles = useGroupStyles();

  return (
    <View style={styles.screenHeader}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [styles.headerIconButton, pressed && styles.pressed]}>
        <SymbolView
          name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
          size={23}
          weight="semibold"
          tintColor={styles.headerIcon.color}
        />
      </Pressable>
      <ThemedText type="bold" numberOfLines={1} style={styles.screenTitle}>
        {title}
      </ThemedText>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          accessibilityState={{ busy: actionPending, disabled: actionDisabled }}
          disabled={actionDisabled || actionPending}
          hitSlop={6}
          onPress={onAction}
          style={({ pressed }) => [
            styles.headerAction,
            actionDisabled && styles.headerActionDisabled,
            pressed && styles.pressed,
          ]}>
          {actionPending ? (
            <ActivityIndicator size="small" color={styles.headerActionText.color} />
          ) : (
            <ThemedText type="bold" style={styles.headerActionText}>
              {actionLabel}
            </ThemedText>
          )}
        </Pressable>
      ) : (
        <View style={styles.headerActionPlaceholder} />
      )}
    </View>
  );
}
