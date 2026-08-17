import { InputWithIcon } from '@/shared/components/ui/input-with-icon';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { useTheme } from '@/shared/hooks/use-theme';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Form } from 'tamagui';
import AuthFormCard from './auth-form-card';
import AuthFormField from './auth-form-field';
import AuthPrimaryButton from './auth-primary-button';

const ResetPasswordForm = () => {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.wrapper}>
      <AuthFormCard>
        <Form style={styles.form}>
          <AuthFormField label="Email address">
            <InputWithIcon
              icon={{ ios: 'envelope', android: 'mail', web: 'mail' }}
              iconColor={theme.textSecondary}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="done"
            />
          </AuthFormField>
          <ThemedText themeColor="textSecondary" style={styles.helperText}>
            We’ll send reset instructions if an account exists for this email.
          </ThemedText>
          <AuthPrimaryButton label="Send reset instructions" />
        </Form>
      </AuthFormCard>

      <View style={styles.footer}>
        <Link href="/login" replace style={styles.footerLink}>
          Back to sign in
        </Link>
      </View>
    </View>
  );
};

const useStyles = () => {
  const { theme } = useAppTheme();

  return StyleSheet.create({
    wrapper: {
      gap: 20,
    },
    form: {
      gap: 18,
    },
    helperText: {
      marginTop: -6,
      fontSize: 12,
      lineHeight: 18,
    },
    footer: {
      alignItems: 'center',
    },
    footerLink: {
      color: theme === 'dark' ? '#BFB1FF' : '#5B49B8',
      fontSize: 13,
      fontWeight: '700',
    },
  });
};

export default ResetPasswordForm;
