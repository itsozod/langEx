import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

import { ThemedText } from '@/shared/components/ui/themed-text';

type LoginPrimaryButtonProps = {
  label: string;
  onPress: () => void;
  pending: boolean;
};

export function LoginPrimaryButton({ label, onPress, pending }: LoginPrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      cancelable={false}
      disabled={pending}
      onPress={onPress}
      pressRetentionOffset={12}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        pending && styles.buttonDisabled,
      ]}>
      <View pointerEvents="none" style={styles.content}>
        {pending ? <ActivityIndicator color="#FFFFFF" size="small" /> : null}
        <ThemedText type="bold" style={styles.label}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

// Solid accent, no gradient or glow; height matches the inputs' rhythm.
const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B57D6',
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.6 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: { color: '#FFFFFF', fontFamily: 'PlusJakartaSansSemiBold', fontSize: 16 },
});
