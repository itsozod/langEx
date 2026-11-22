import { useAppTheme } from '@/providers/theme-provider';
import { useUiTokens } from '@/shared/hooks/use-ui-tokens';
import { useGoogleAuthMutation } from '@/screens/auth/hooks';
import { ThemedText } from '@/shared/components/ui/themed-text';
import GoogleLogo from '@/assets/images/google.svg';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import type { OneTapSuccessData } from 'react-native-nitro-google-signin';
import { AuthDivider } from './auth-divider';
import { useTranslation } from 'react-i18next';
import i18n from '@/shared/i18n';

type GoogleAuthSdk = typeof import('react-native-nitro-google-signin');

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const isConfigured = Boolean(webClientId && (Platform.OS !== 'ios' || iosClientId));

function readableGoogleError(error: unknown) {
  if (!(error instanceof Error)) return i18n.t('auth:google.failed');

  if (error.message.includes('SIGN_IN_CANCELLED')) return null;
  if (error.message.includes('PLAY_SERVICES_NOT_AVAILABLE')) {
    return i18n.t('auth:google.playServices');
  }
  if (error.message.includes('DEVELOPER_ERROR')) {
    return i18n.t('auth:google.notConfigured');
  }

  return error.message || i18n.t('auth:google.failed');
}

export function GoogleAuthOption() {
  const tokens = useUiTokens();
  const styles = useStyles();
  const { t } = useTranslation('auth');
  const mutation = useGoogleAuthMutation();
  const [sdk, setSdk] = useState<GoogleAuthSdk | null>(null);
  const [nativeError, setNativeError] = useState<string | null>(null);
  const [isOpeningGoogle, setIsOpeningGoogle] = useState(false);

  useEffect(() => {
    if (!isConfigured || !webClientId) return;

    let cancelled = false;

    void import('react-native-nitro-google-signin')
      .then((googleSdk) => {
        googleSdk.GoogleOneTapSignIn.configure({
          webClientId,
          iosClientId: iosClientId ?? null,
          autoSelectOnSignIn: false,
        });

        if (!cancelled) setSdk(googleSdk);
      })
      .catch((error: unknown) => {
        if (__DEV__) {
          console.warn(
            'Google sign-in is unavailable in this installed build. Rebuild the development client.',
            error,
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const submitIdentity = (identity: OneTapSuccessData) => {
    if (!identity.idToken) {
      setNativeError(t('google.noToken'));
      return;
    }

    mutation.mutate({ idToken: identity.idToken });
  };

  const openGoogle = async () => {
    if (!sdk || mutation.isPending || isOpeningGoogle) return;

    setNativeError(null);
    mutation.reset();
    setIsOpeningGoogle(true);

    try {
      await sdk.GoogleOneTapSignIn.checkPlayServices();
      const response = await sdk.GoogleOneTapSignIn.presentExplicitSignIn();

      if (sdk.isSuccessResponse(response)) submitIdentity(response.data);
    } catch (error) {
      setNativeError(readableGoogleError(error));
    } finally {
      setIsOpeningGoogle(false);
    }
  };

  if (!isConfigured || !sdk) return null;

  const isPending = isOpeningGoogle || mutation.isPending;
  const error = nativeError ?? (mutation.error instanceof Error ? mutation.error.message : null);

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityLabel={t('google.continue')}
        accessibilityRole="button"
        accessibilityState={{ busy: isPending, disabled: isPending }}
        disabled={isPending}
        onPress={() => void openGoogle()}
        style={({ pressed }) => [
          styles.googleButton,
          pressed && styles.googleButtonPressed,
          isPending && styles.googleButtonDisabled,
        ]}>
        <View pointerEvents="none" style={styles.buttonContent}>
          <View style={styles.googleLogoSurface}>
            <GoogleLogo height={18} width={18} />
          </View>
          <ThemedText
            maxFontSizeMultiplier={1.4}
            numberOfLines={1}
            style={styles.googleButtonLabel}>
            {isPending ? t('signingIn') : t('google.continue')}
          </ThemedText>
        </View>
        {isPending ? (
          <ActivityIndicator color={tokens.loader} size="small" style={styles.activityIndicator} />
        ) : null}
      </Pressable>

      {error ? (
        <ThemedText accessibilityLiveRegion="polite" role="alert" style={styles.errorText}>
          {error}
        </ThemedText>
      ) : null}

      <AuthDivider />
    </View>
  );
}

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    section: { gap: 18 },
    googleButton: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      borderCurve: 'continuous',
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(24,21,31,0.06)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleButtonPressed: { opacity: 0.7 },
    googleButtonDisabled: {
      opacity: 0.72,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Platform.OS === 'ios' ? 12 : 10,
    },
    googleLogoSurface: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleButtonLabel: {
      color: isDark ? '#F4F2F8' : '#18151F',
      fontFamily: 'PlusJakartaSansSemiBold',
      fontSize: 16,
      lineHeight: 20,
    },
    activityIndicator: {
      position: 'absolute',
      right: Platform.OS === 'ios' ? 16 : 12,
    },
    errorText: {
      marginTop: -8,
      color: isDark ? '#FF6B7D' : '#D2364B',
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
    },
  });
};
