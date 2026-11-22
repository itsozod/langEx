import { ThemedText } from '@/shared/components/ui/themed-text';
import { InputWithIcon } from '@/shared/components/ui/input-with-icon';
import { useAppTheme } from '@/providers/theme-provider';
import { useRequestRegistrationVerificationMutation } from '@/screens/auth/hooks';
import { registerSchema, type RegisterFormValues } from '@/screens/auth/schemas';
import type { RegisterCredentials } from '@/screens/auth/types';
import { useTheme } from '@/shared/hooks/use-theme';
import { ApiError } from '@/shared/lib/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Form } from 'tamagui';
import AuthFormCard from './auth-form-card';
import AuthFormField from './auth-form-field';
import AuthPrimaryButton from './auth-primary-button';
import { GoogleAuthOption } from './google-auth-option';
import PasswordInput from './password-input';
import RegistrationCodeStep from './registration-code-step';
import { useTranslation } from 'react-i18next';

type PendingRegistration = {
  credentials: RegisterCredentials;
  resendAfterSeconds: number;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const RegisterForm = ({ isAddingAccount = false }: { isAddingAccount?: boolean }) => {
  const theme = useTheme();
  const styles = useStyles();
  const { t } = useTranslation('auth');
  const requestMutation = useRequestRegistrationVerificationMutation();
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(null);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    clearErrors('root.server');
    requestMutation.reset();

    try {
      const credentials = {
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      };

      if (
        pendingRegistration &&
        normalizeEmail(credentials.email) === normalizeEmail(pendingRegistration.credentials.email)
      ) {
        setPendingRegistration((current) => (current ? { ...current, credentials } : current));
        setIsEditingCredentials(false);
        return;
      }

      const response = await requestMutation.mutateAsync({ email: credentials.email });
      setPendingRegistration({
        credentials,
        resendAfterSeconds: response.resendAfterSeconds,
      });
      setIsEditingCredentials(false);
    } catch (error) {
      const message =
        error instanceof ApiError && error.status === 409
          ? t('registrationVerification.alreadyRegistered')
          : error instanceof ApiError && error.status === 429
            ? t('registrationVerification.tooManyRequests')
            : t('registrationVerification.requestFailed');
      setError('root.server', {
        type: 'server',
        message,
      });
    }
  };

  const submit = handleSubmit(onSubmit);
  const isPending = requestMutation.isPending || isSubmitting;

  return (
    <View style={styles.wrapper}>
      {pendingRegistration && !isEditingCredentials ? (
        <RegistrationCodeStep
          credentials={pendingRegistration.credentials}
          initialResendAfterSeconds={pendingRegistration.resendAfterSeconds}
          onEditEmail={(resendAfterSeconds) => {
            requestMutation.reset();
            clearErrors('root.server');
            setPendingRegistration((current) =>
              current ? { ...current, resendAfterSeconds } : current,
            );
            setIsEditingCredentials(true);
          }}
          onResend={(resendAfterSeconds) => {
            setPendingRegistration((current) =>
              current
                ? {
                    ...current,
                    resendAfterSeconds,
                  }
                : current,
            );
          }}
        />
      ) : (
        <AuthFormCard>
          <Form style={styles.form}>
            <GoogleAuthOption />
            <View style={styles.fields}>
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
                        clearErrors('root.server');
                      }}
                      placeholder={t('fields.emailPlaceholder')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      disabled={isPending}
                      returnKeyType="next"
                    />
                  )}
                />
              </AuthFormField>

              <AuthFormField label={t('fields.password')} error={errors.password?.message}>
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
                        clearErrors('confirmPassword');
                        clearErrors('root.server');
                      }}
                      placeholder={t('fields.createPasswordPlaceholder')}
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
                label={t('fields.confirmPassword')}
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
                        clearErrors('root.server');
                      }}
                      placeholder={t('fields.confirmPasswordPlaceholder')}
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

            {errors.root?.server?.message ? (
              <View style={styles.serverError}>
                <ThemedText style={styles.serverErrorText}>{errors.root.server.message}</ThemedText>
              </View>
            ) : null}

            <AuthPrimaryButton
              label={
                isPending
                  ? t('registrationVerification.sending')
                  : t('registrationVerification.sendCode')
              }
              pending={isPending}
              onPress={() => void submit()}
            />
          </Form>
        </AuthFormCard>
      )}

      <View style={styles.footer}>
        <ThemedText themeColor="textSecondary" style={styles.footerText}>
          {t('register.haveAccount')}
        </ThemedText>
        <Link
          href={isAddingAccount ? '/account-auth/login' : '/login'}
          replace
          style={styles.footerLink}>
          {t('login.submit')}
        </Link>
      </View>
    </View>
  );
};

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    wrapper: {
      gap: 20,
    },
    form: {
      gap: 20,
    },
    fields: {
      gap: 16,
    },
    serverError: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(24,21,31,0.06)',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    serverErrorText: {
      color: isDark ? '#FF6B7D' : '#D2364B',
      fontSize: 12,
      lineHeight: 18,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
    },
    footerText: {
      fontSize: 13,
    },
    footerLink: {
      color: isDark ? '#A898FF' : '#5F4CC9',
      fontSize: 13,
      fontWeight: '700',
    },
  });
};

export default RegisterForm;
