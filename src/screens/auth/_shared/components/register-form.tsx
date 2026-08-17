import { ThemedText } from '@/shared/components/ui/themed-text';
import { InputWithIcon } from '@/shared/components/ui/input-with-icon';
import { useAppTheme } from '@/providers/theme-provider';
import { useRegisterMutation } from '@/screens/auth/hooks';
import { registerSchema, type RegisterFormValues } from '@/screens/auth/schemas';
import { useTheme } from '@/shared/hooks/use-theme';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Form } from 'tamagui';
import AuthFormCard from './auth-form-card';
import AuthFormField from './auth-form-field';
import AuthPrimaryButton from './auth-primary-button';
import PasswordInput from './password-input';

const RegisterForm = () => {
  const theme = useTheme();
  const styles = useStyles();
  const registerMutation = useRegisterMutation();
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync({
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
    } catch (error) {
      setError('root.server', {
        type: 'server',
        message: error instanceof Error ? error.message : 'Unable to create your account.',
      });
    }
  };

  const submit = handleSubmit(onSubmit);

  return (
    <View style={styles.wrapper}>
      <AuthFormCard>
        <Form style={styles.form}>
          <View style={styles.fields}>
            <AuthFormField label="Email address" error={errors.email?.message}>
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
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    disabled={registerMutation.isPending}
                    returnKeyType="next"
                  />
                )}
              />
            </AuthFormField>

            <AuthFormField label="Password" error={errors.password?.message}>
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
                    placeholder="Create a password"
                    autoCapitalize="none"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    disabled={registerMutation.isPending}
                    returnKeyType="next"
                  />
                )}
              />
            </AuthFormField>

            <AuthFormField label="Confirm password" error={errors.confirmPassword?.message}>
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
                    placeholder="Repeat your password"
                    autoCapitalize="none"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    disabled={registerMutation.isPending}
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
            label={registerMutation.isPending ? 'Creating account…' : 'Create account'}
            pending={registerMutation.isPending}
            onPress={() => void submit()}
          />
        </Form>
      </AuthFormCard>

      <View style={styles.footer}>
        <ThemedText themeColor="textSecondary" style={styles.footerText}>
          Already have an account?
        </ThemedText>
        <Link href="/login" replace style={styles.footerLink}>
          Sign in
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
      backgroundColor: isDark ? 'rgba(255, 112, 112, 0.10)' : '#FFF1F0',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 140, 140, 0.22)' : '#FFD0CC',
    },
    serverErrorText: {
      color: isDark ? '#FFAAAA' : '#9F2018',
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
      color: isDark ? '#BFB1FF' : '#5B49B8',
      fontSize: 13,
      fontWeight: '700',
    },
  });
};

export default RegisterForm;
