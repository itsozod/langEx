import { ThemedText } from '@/shared/components/ui/themed-text';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Button, type ButtonProps } from 'tamagui';

type AuthPrimaryButtonProps = Omit<ButtonProps, 'children'> & {
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
    <Button
      height={54}
      rounded={15}
      borderWidth={0}
      bg="#6654C7"
      pressStyle={{ bg: '#5745B4', scale: 0.99 }}
      hoverStyle={{ bg: '#5D4BBD' }}
      focusStyle={{ bg: '#5745B4' }}
      opacity={pending ? 0.72 : 1}
      disabled={pending || disabled}
      icon={pending ? <ActivityIndicator color="#FFFFFF" size="small" /> : undefined}
      {...props}>
      <ThemedText type="bold" style={{ color: '#FFFFFF', fontSize: 15 }}>
        {label}
      </ThemedText>
    </Button>
  );
};

export default AuthPrimaryButton;
