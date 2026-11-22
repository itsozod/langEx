import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';
import { useRequestPasswordResetMutation } from '@/screens/auth/hooks';
import {
  passwordResetRequestSchema,
  type PasswordResetRequestFormValues,
} from '@/screens/auth/schemas';
import { InputWithIcon } from '@/shared/components/ui/input-with-icon';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useTheme } from '@/shared/hooks/use-theme';
import { ApiError } from '@/shared/lib/api-client';

import AuthFormCard from './auth-form-card';
import AuthFormField from './auth-form-field';
import AuthPrimaryButton from './auth-primary-button';

type ResetPasswordFormProps = {
  isAddingAccount?: boolean;
};

const ResetPasswordForm = ({ isAddingAccount = false }: ResetPasswordFormProps) => {
  const theme = useTheme();
  const styles = useStyles();
  const { t } = useTranslation('auth');
  const requestMutation = useRequestPasswordResetMutation();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetRequestFormValues>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: PasswordResetRequestFormValues) => {
    clearErrors('root.server');
    requestMutation.reset();

    try {
      await requestMutation.mutateAsync(values);
      setSubmittedEmail(values.email.trim().toLowerCase());
    } catch (error) {
      const message =
        error instanceof ApiError && error.status === 429
          ? t('resetPassword.tooManyRequests')
          : t('resetPassword.requestFailed');
      setError('root.server', { type: 'server', message });
    }
  };

  const submit = handleSubmit(onSubmit);
  const isPending = requestMutation.isPending || isSubmitting;
  const signInHref = isAddingAccount ? '/account-auth/login' : '/login';

  if (submittedEmail) {
    return (
      <View style={styles.wrapper}>
        <AuthFormCard>
          <View accessibilityLiveRegion="polite" style={styles.successContent}>
            <ThemedText type="bold" style={styles.successTitle}>
              {t('resetPassword.checkEmailTitle')}
            </ThemedText>
            <ThemedText themeColor="textSecondary" selectable style={styles.successText}>
              {t('resetPassword.checkEmailMessage', { email: submittedEmail })}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.successHint}>
              {t('resetPassword.checkSpam')}
            </ThemedText>
          </View>
        </AuthFormCard>

        <View style={styles.footer}>
          <Link href={signInHref} replace style={styles.footerLink}>
            {t('resetPassword.backToSignIn')}
          </Link>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <AuthFormCard>
        <View style={styles.form}>
          <AuthFormField label={t('fields.email')} error={errors.email?.message}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onBlur, onChange, value } }) => (
                <InputWithIcon
                  icon={{ ios: 'envelope', android: 'mail', web: 'mail' }}
                  iconColor={theme.textSecondary}
                  hasError={Boolean(errors.email)}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    onChange(text);
                    clearErrors();
                  }}
                  placeholder={t('fields.emailPlaceholder')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  disabled={isPending}
                  returnKeyType="done"
                  onSubmitEditing={() => void submit()}
                />
              )}
            />
          </AuthFormField>

          <ThemedText themeColor="textSecondary" style={styles.helperText}>
            {t('resetPassword.helper')}
          </ThemedText>

          {errors.root?.server?.message ? (
            <View accessibilityLiveRegion="polite" style={styles.serverError}>
              <ThemedText selectable style={styles.serverErrorText}>
                {errors.root.server.message}
              </ThemedText>
            </View>
          ) : null}

          <AuthPrimaryButton
            label={isPending ? t('resetPassword.submitting') : t('resetPassword.submit')}
            pending={isPending}
            onPress={() => void submit()}
          />
        </View>
      </AuthFormCard>

      <View style={styles.footer}>
        <Link href={signInHref} replace style={styles.footerLink}>
          {t('resetPassword.backToSignIn')}
        </Link>
      </View>
    </View>
  );
};

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    wrapper: { gap: 20 },
    form: { gap: 18 },
    helperText: {
      marginTop: -6,
      fontSize: 12,
      lineHeight: 18,
    },
    serverError: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderCurve: 'continuous',
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(24,21,31,0.06)',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    serverErrorText: {
      color: isDark ? '#FF6B7D' : '#D2364B',
      fontSize: 12,
      lineHeight: 18,
    },
    successContent: { gap: 10 },
    successTitle: {
      color: isDark ? '#F4F2F8' : '#18151F',
      fontSize: 18,
      lineHeight: 24,
    },
    successText: { fontSize: 14, lineHeight: 21 },
    successHint: { fontSize: 12, lineHeight: 18 },
    footer: { alignItems: 'center' },
    footerLink: {
      color: isDark ? '#A898FF' : '#5F4CC9',
      fontSize: 13,
      fontWeight: '700',
    },
  });
};

export default ResetPasswordForm;
