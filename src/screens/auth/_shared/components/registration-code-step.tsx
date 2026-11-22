import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import {
  useConfirmRegistrationMutation,
  useRequestRegistrationVerificationMutation,
} from '@/screens/auth/hooks';
import type { RegisterCredentials } from '@/screens/auth/types';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useUiTokens } from '@/shared/hooks/use-ui-tokens';
import { ApiError } from '@/shared/lib/api-client';

import AuthFormCard from './auth-form-card';
import AuthFormField from './auth-form-field';
import RegistrationCodeInput from './registration-code-input';

type RegistrationCodeStepProps = {
  credentials: RegisterCredentials;
  initialResendAfterSeconds: number;
  onEditEmail: (resendAfterSeconds: number) => void;
  onResend: (resendAfterSeconds: number) => void;
};

const RegistrationCodeStep = ({
  credentials,
  initialResendAfterSeconds,
  onEditEmail,
  onResend,
}: RegistrationCodeStepProps) => {
  const tokens = useUiTokens();
  const { t } = useTranslation('auth');
  const confirmMutation = useConfirmRegistrationMutation();
  const resendMutation = useRequestRegistrationVerificationMutation();
  const inputRef = useRef<TextInput>(null);
  const submissionLocked = useRef(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendDeadline, setResendDeadline] = useState(
    () => Date.now() + initialResendAfterSeconds * 1000,
  );
  const [resendSeconds, setResendSeconds] = useState(initialResendAfterSeconds);
  useEffect(() => {
    const updateCountdown = () => {
      return Math.max(0, Math.ceil((resendDeadline - Date.now()) / 1000));
    };

    if (updateCountdown() === 0) return;

    const timer = setInterval(() => {
      const seconds = updateCountdown();
      setResendSeconds(seconds);
      if (seconds === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendDeadline]);

  const confirmCode = async (completeCode: string) => {
    if (submissionLocked.current) return;
    submissionLocked.current = true;
    setCodeError(null);
    setServerError(null);
    confirmMutation.reset();

    try {
      await confirmMutation.mutateAsync({ ...credentials, code: completeCode });
    } catch (error) {
      const codeWasRejected = error instanceof ApiError && error.status === 400;
      if (codeWasRejected) {
        setCodeError(t('registrationVerification.invalidCode'));
      } else {
        setServerError(
          error instanceof ApiError && error.status === 409
            ? t('registrationVerification.alreadyRegistered')
            : t('registrationVerification.confirmFailed'),
        );
      }
      setCode('');
      requestAnimationFrame(() => inputRef.current?.focus());
    } finally {
      submissionLocked.current = false;
    }
  };

  const changeCode = (nextCode: string) => {
    setCode(nextCode);
    setCodeError(null);
    setServerError(null);
    if (nextCode.length === 6) void confirmCode(nextCode);
  };

  const resendCode = async () => {
    setCodeError(null);
    setServerError(null);
    resendMutation.reset();

    try {
      const response = await resendMutation.mutateAsync({ email: credentials.email });
      setCode('');
      setResendSeconds(response.resendAfterSeconds);
      setResendDeadline(Date.now() + response.resendAfterSeconds * 1000);
      onResend(response.resendAfterSeconds);
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (error) {
      setServerError(
        error instanceof ApiError && error.status === 429
          ? t('registrationVerification.tooManyRequests')
          : t('registrationVerification.requestFailed'),
      );
    }
  };

  const isPending = confirmMutation.isPending;
  const isResending = resendMutation.isPending;

  return (
    <AuthFormCard>
      <View style={styles.form}>
        <View accessibilityLiveRegion="polite" style={styles.intro}>
          <ThemedText type="bold" style={styles.title}>
            {t('registrationVerification.title')}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.description}>
            {t('registrationVerification.description')}
          </ThemedText>
          <ThemedText selectable type="bold" style={styles.email}>
            {credentials.email}
          </ThemedText>
        </View>

        <AuthFormField label={t('fields.verificationCode')} error={codeError ?? undefined}>
          <RegistrationCodeInput
            ref={inputRef}
            accessibilityLabel={t('fields.verificationCode')}
            disabled={isPending || isResending}
            hasError={Boolean(codeError)}
            value={code}
            onChangeText={changeCode}
          />
        </AuthFormField>

        {isPending ? (
          <View accessibilityLiveRegion="polite" style={styles.checkingRow}>
            <ActivityIndicator color={tokens.loader} size="small" />
            <ThemedText themeColor="textSecondary" style={styles.checkingText}>
              {t('registrationVerification.confirming')}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable
            accessibilityRole="button"
            disabled={isPending || isResending}
            onPress={() => onEditEmail(resendSeconds)}
            hitSlop={8}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText style={[styles.link, { color: tokens.accentText }]}>
              {t('registrationVerification.changeEmail')}
            </ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={resendSeconds > 0 || isPending || isResending}
            onPress={() => void resendCode()}
            hitSlop={8}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText
              style={[
                styles.link,
                { color: tokens.accentText },
                resendSeconds > 0 && styles.linkDisabled,
              ]}
              accessibilityLiveRegion="polite">
              {resendSeconds > 0
                ? t('registrationVerification.resendIn', { seconds: resendSeconds })
                : isResending
                  ? t('registrationVerification.resending')
                  : t('registrationVerification.resend')}
            </ThemedText>
          </Pressable>
        </View>

        {serverError ? (
          <View
            accessibilityLiveRegion="polite"
            style={[styles.serverError, { backgroundColor: tokens.fill }]}>
            <ThemedText selectable style={[styles.serverErrorText, { color: tokens.danger }]}>
              {serverError}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </AuthFormCard>
  );
};

const styles = StyleSheet.create({
  form: { gap: 18 },
  intro: { gap: 7 },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  description: { fontSize: 14, lineHeight: 21 },
  email: { fontSize: 14, lineHeight: 20 },
  checkingRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkingText: { fontSize: 13, lineHeight: 18 },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  link: {
    fontSize: 13,
    fontWeight: '700',
  },
  linkDisabled: { opacity: 0.55 },
  pressed: { opacity: 0.6 },
  serverError: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  serverErrorText: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default RegistrationCodeStep;
