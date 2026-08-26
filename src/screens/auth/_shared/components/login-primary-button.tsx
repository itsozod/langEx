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

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 54,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6654C7',
  },
  buttonPressed: { backgroundColor: '#5745B4', transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.72 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: { color: '#FFFFFF', fontSize: 15 },
});
