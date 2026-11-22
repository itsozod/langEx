import { ThemedText } from '@/shared/components/ui/themed-text';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

type AuthPrimaryButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  pending?: boolean;
};

const AuthPrimaryButton = ({
  label,
  pending = false,
  disabled,
  ...props
}: AuthPrimaryButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={pending || disabled}
      {...props}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        (pending || disabled) && styles.buttonDisabled,
      ]}>
      <View style={styles.content} pointerEvents="none">
        {pending ? <ActivityIndicator color="#FFFFFF" size="small" /> : null}
        <ThemedText type="bold" style={styles.label}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
};

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
export default AuthPrimaryButton;
