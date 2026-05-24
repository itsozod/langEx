import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useAppTheme } from '@/context/ThemeContext';
import { useTheme } from '@/hooks/use-theme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Form, Input, Label, View } from 'tamagui';

const LoginForm = () => {
  const appTheme = useAppTheme();
  const theme = useTheme();
  return (
    <View
      style={[
        styles.loginForm,
        {
          backgroundColor: theme.background,
          boxShadow:
            appTheme.theme === 'dark'
              ? '0 12px 32px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(126, 95, 255, 0.25)'
              : '0 12px 32px rgba(82, 63, 184, 0.18), 0 2px 6px rgba(82, 63, 184, 0.10)',
        },
      ]}>
      <Form>
        <Label>Email address</Label>
        <Input type="email" />
        <Label>Password</Label>
        <Input type="password" />
        <PrimaryButton style={{ marginTop: 30 }}>
          <ThemedText type="bold" style={{ color: '#462A00' }}>
            Log in
          </ThemedText>
        </PrimaryButton>
      </Form>
    </View>
  );
};

const styles = StyleSheet.create({
  loginForm: {
    width: '100%',
    padding: 25,
    borderRadius: 16,
    marginTop: 10,
  },
});

export default LoginForm;
