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

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 54,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6654C7',
  },
  buttonPressed: {
    backgroundColor: '#5745B4',
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});

export default AuthPrimaryButton;
