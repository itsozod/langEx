import GoogleIcon from '@/assets/images/google.svg';
import { ThemedText } from '@/components/ui/themed-text';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useAppTheme } from '@/context/ThemeContext';
import { useTheme } from '@/hooks/use-theme';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Form, Label, View } from 'tamagui';

const LoginForm = () => {
  const theme = useTheme();
  const styles = useStyles();
  const { theme: appTheme } = useAppTheme();
  return (
    <>
      <View style={styles.loginForm}>
        <Form style={{ display: 'flex', gap: 20 }}>
          <View>
            <Label style={styles.label}>Email address</Label>
            <InputWithIcon icon="envelope" type="email" iconColor={theme.textSecondary} />
            <Label style={styles.label}>Password</Label>
            <InputWithIcon icon="lock" type="password" iconColor={theme.textSecondary} />
            <Link href={'/reset-password'} style={styles.forgotPassword}>
              Forgot password?
            </Link>
          </View>
          <PrimaryButton style={{ height: 52 }}>
            <ThemedText type="bold" style={{ color: '#462A00' }}>
              Log in
            </ThemedText>
          </PrimaryButton>
          <ThemedText style={styles.continue}>OR CONTINUE WITH</ThemedText>
          <Button
            icon={<GoogleIcon />}
            style={styles.googleButton}
            borderWidth={1}
            borderColor={appTheme === 'dark' ? '#928F9E' : '#C8C4D5'}
            pressStyle={{ opacity: 0.85, bg: 'transparent' }}
            hoverStyle={{ bg: 'transparent' }}>
            <ThemedText type="smallBold" style={styles.googleButtonText}>
              Continue with Google
            </ThemedText>
          </Button>
        </Form>
      </View>
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 5,
        }}>
        <ThemedText style={styles.noAccount}>Don't have an account?</ThemedText>
        <Link href={'/register'} replace style={styles.signUp}>
          Sign up
        </Link>
      </View>
    </>
  );
};

const useStyles = () => {
  const { theme: appTheme } = useAppTheme();
  const theme = useTheme();
  return StyleSheet.create({
    loginForm: {
      width: '100%',
      padding: 25,
      borderRadius: 16,
      backgroundColor: theme.background,
      boxShadow:
        appTheme === 'dark'
          ? '0 12px 32px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(126, 95, 255, 0.25)'
          : '0 12px 32px rgba(82, 63, 184, 0.18), 0 2px 6px rgba(82, 63, 184, 0.10)',
      marginTop: 10,
    },
    label: {
      fontSize: 12,
      color: appTheme === 'dark' ? '#C8C4D5' : '#474553',
      letterSpacing: 0.3,
      fontWeight: '700',
    },
    forgotPassword: {
      color: appTheme === 'dark' ? '#FFB95D' : '#3B309E',
      fontSize: 12,
      textAlign: 'right',
      marginTop: 10,
    },
    continue: {
      fontSize: 12,
      color: '#928F9E',
      letterSpacing: 0.6,
      textAlign: 'center',
    },
    googleButton: {
      borderRadius: 12,
      backgroundColor: appTheme === 'dark' ? '#151023' : '#ffffff',
      height: 52,
      width: '100%',
    },

    googleButtonText: {
      color: appTheme === 'dark' ? '#E8DEF9' : '#191C1D',
    },
    noAccount: {
      fontSize: 14,
      color: appTheme === 'dark' ? '#C8C4D5' : '#474553',
    },
    signUp: {
      color: appTheme === 'dark' ? '#FFB95D' : '#3B309E',
      fontSize: 14,
      fontWeight: 'bold',
    },
  });
};

export default LoginForm;
