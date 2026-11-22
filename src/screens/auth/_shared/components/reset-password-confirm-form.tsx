import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';
import { useConfirmPasswordResetMutation } from '@/screens/auth/hooks';
import {
  passwordResetConfirmationSchema,
  type PasswordResetConfirmationFormValues,
} from '@/screens/auth/schemas';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { ApiError } from '@/shared/lib/api-client';
import { useAuthStore } from '@/shared/store/auth-store';

import AuthFormCard from './auth-form-card';
import AuthFormField from './auth-form-field';
import AuthPrimaryButton from './auth-primary-button';
import PasswordInput from './password-input';

type ResetPasswordConfirmFormProps = {
  token: string | null;
};

const ResetPasswordConfirmForm = ({ token }: ResetPasswordConfirmFormProps) => {
  const styles = useStyles();
  const { t } = useTranslation('auth');
  const hasSession = useAuthStore((state) => Boolean(state.token));
  const confirmMutation = useConfirmPasswordResetMutation();
  const [isComplete, setIsComplete] = useState(false);
  const [isLinkInvalid, setIsLinkInvalid] = useState(token === null);
  const {
    control,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetConfirmationFormValues>({
    resolver: zodResolver(passwordResetConfirmationSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const returnToSignIn = () => {
    router.replace(hasSession ? '/account-auth/login' : '/login');
  };

  const requestAnotherLink = () => {
    router.replace(hasSession ? '/account-auth/reset-password' : '/reset-password');
  };

  const onSubmit = async (values: PasswordResetConfirmationFormValues) => {
    if (!token) return;

    clearErrors('root.server');
    confirmMutation.reset();

    try {
      await confirmMutation.mutateAsync({ token, ...values });
      setIsComplete(true);
    } catch (error) {
      const linkWasRejected = error instanceof ApiError && error.status === 400;
      if (linkWasRejected) setIsLinkInvalid(true);
      setError('root.server', {
        type: 'server',
        message: linkWasRejected
          ? t('resetPasswordConfirm.invalidOrExpired')
          : t('resetPasswordConfirm.failed'),
      });
    }
  };

  const submit = handleSubmit(onSubmit);
  const isPending = confirmMutation.isPending || isSubmitting;

  if (isComplete) {
    return (
      <AuthFormCard>
        <View accessibilityLiveRegion="polite" style={styles.stateContent}>
          <ThemedText type="bold" style={styles.stateTitle}>
            {t('resetPasswordConfirm.successTitle')}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.stateText}>
            {t('resetPasswordConfirm.successMessage')}
          </ThemedText>
          <AuthPrimaryButton label={t('resetPasswordConfirm.signIn')} onPress={returnToSignIn} />
        </View>
      </AuthFormCard>
    );
  }

  if (isLinkInvalid) {
    return (
      <AuthFormCard>
        <View accessibilityLiveRegion="polite" style={styles.stateContent}>
          <ThemedText type="bold" style={styles.stateTitle}>
            {t('resetPasswordConfirm.invalidTitle')}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.stateText}>
            {t('resetPasswordConfirm.invalidOrExpired')}
          </ThemedText>
          <AuthPrimaryButton
            label={t('resetPasswordConfirm.requestAnother')}
            onPress={requestAnotherLink}
          />
        </View>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard>
      <View style={styles.form}>
        <View style={styles.fields}>
          <AuthFormField label={t('fields.newPassword')} error={errors.password?.message}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onBlur, onChange, value } }) => (
                <PasswordInput
                  hasError={Boolean(errors.password)}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    onChange(text);
                    clearErrors();
                  }}
                  placeholder={t('fields.newPasswordPlaceholder')}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  textContentType="newPassword"
                  disabled={isPending}
                  returnKeyType="next"
                />
              )}
            />
          </AuthFormField>

          <AuthFormField
            label={t('fields.confirmNewPassword')}
            error={errors.confirmPassword?.message}>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onBlur, onChange, value } }) => (
                <PasswordInput
                  hasError={Boolean(errors.confirmPassword)}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    onChange(text);
                    clearErrors();
                  }}
                  placeholder={t('fields.confirmNewPasswordPlaceholder')}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  textContentType="newPassword"
                  disabled={isPending}
                  returnKeyType="done"
                  onSubmitEditing={() => void submit()}
                />
              )}
            />
          </AuthFormField>
        </View>

        <ThemedText themeColor="textSecondary" style={styles.helperText}>
          {t('resetPasswordConfirm.passwordHint')}
        </ThemedText>

        {errors.root?.server?.message ? (
          <View accessibilityLiveRegion="polite" style={styles.serverError}>
            <ThemedText selectable style={styles.serverErrorText}>
              {errors.root.server.message}
            </ThemedText>
          </View>
        ) : null}

        <AuthPrimaryButton
          label={
            isPending ? t('resetPasswordConfirm.submitting') : t('resetPasswordConfirm.submit')
          }
          pending={isPending}
          onPress={() => void submit()}
        />
      </View>
    </AuthFormCard>
  );
};

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    form: { gap: 18 },
    fields: { gap: 16 },
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
      backgroundColor: isDark ? 'rgba(255, 112, 112, 0.10)' : '#FFF1F0',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 140, 140, 0.22)' : '#FFD0CC',
    },
    serverErrorText: {
      color: isDark ? '#FFAAAA' : '#9F2018',
      fontSize: 12,
      lineHeight: 18,
    },
    stateContent: { gap: 16 },
    stateTitle: {
      color: isDark ? '#F0ECFF' : '#282332',
      fontSize: 18,
      lineHeight: 24,
    },
    stateText: { fontSize: 14, lineHeight: 21 },
  });
};

export default ResetPasswordConfirmForm;
