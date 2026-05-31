import { ThemedText } from '@/components/ui/themed-text';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useAppTheme } from '@/context/ThemeContext';
import { useTheme } from '@/hooks/use-theme';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Form, Label, View } from 'tamagui';

const RegisterForm = () => {
  const theme = useTheme();
  const styles = useStyles();
  return (
    <>
      <View style={styles.registerForm}>
        <Form style={{ display: 'flex', gap: 20 }}>
          <View>
            <Label style={styles.label}>Full name</Label>
            <InputWithIcon icon="person" iconColor={theme.textSecondary} />
            <Label style={styles.label}>Email</Label>
            <InputWithIcon icon="envelope" type="email" iconColor={theme.textSecondary} />
            <Label style={styles.label}>Password</Label>
            <InputWithIcon icon="lock" type="password" iconColor={theme.textSecondary} />
            <Label style={styles.label}>Confirm password</Label>
            <InputWithIcon icon="lock" type="password" iconColor={theme.textSecondary} />
          </View>
          <PrimaryButton style={{ height: 52 }}>
            <ThemedText type="bold" style={{ color: '#462A00' }}>
              Create account
            </ThemedText>
          </PrimaryButton>
        </Form>
      </View>
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 5,
        }}>
        <ThemedText style={styles.haveAccount}>Already have an account?</ThemedText>
        <Link href={'/login'} replace style={styles.logIn}>
          Log in
        </Link>
      </View>
    </>
  );
};

const useStyles = () => {
  const { theme: appTheme } = useAppTheme();
  const theme = useTheme();
  return StyleSheet.create({
    registerForm: {
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
    haveAccount: {
      fontSize: 14,
      color: appTheme === 'dark' ? '#C8C4D5' : '#474553',
    },
    logIn: {
      color: appTheme === 'dark' ? '#FFB95D' : '#3B309E',
      fontSize: 14,
      fontWeight: 'bold',
    },
  });
};

export default RegisterForm;
