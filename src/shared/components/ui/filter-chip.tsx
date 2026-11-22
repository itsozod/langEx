import { Pressable, StyleSheet } from 'react-native';

import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';

import { ThemedText } from './themed-text';

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** Single-choice filter chip: filled and neutral, inverted when selected. */
export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const tokens = useUiTokens();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? tokens.text : tokens.fill },
        pressed && !selected && styles.pressed,
      ]}>
      <ThemedText style={[styles.label, { color: selected ? tokens.card : tokens.text }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { height: 32, justifyContent: 'center', borderRadius: 16, paddingHorizontal: 14 },
  label: { fontFamily: FONT.semibold, fontSize: 14, lineHeight: 18 },
  pressed: { opacity: 0.7 },
});
