import { useAppTheme } from '@/providers/theme-provider';
import { useGoogleAuthMutation } from '@/screens/auth/hooks';
import { ThemedText } from '@/shared/components/ui/themed-text';
import GoogleLogo from '@/assets/images/google.svg';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import type { OneTapSuccessData } from 'react-native-nitro-google-signin';
import { AuthDivider } from './auth-divider';

type GoogleAuthSdk = typeof import('react-native-nitro-google-signin');

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const isConfigured = Boolean(webClientId && (Platform.OS !== 'ios' || iosClientId));

function readableGoogleError(error: unknown) {
  if (!(error instanceof Error)) return 'Could not sign in with Google.';

  if (error.message.includes('SIGN_IN_CANCELLED')) return null;
  if (error.message.includes('PLAY_SERVICES_NOT_AVAILABLE')) {
    return 'Google Play services are unavailable or need to be updated.';
  }
  if (error.message.includes('DEVELOPER_ERROR')) {
    return 'Google sign-in is not configured for this app build.';
  }

  return error.message || 'Could not sign in with Google.';
}

export function GoogleAuthOption() {
  const { theme } = useAppTheme();
  const styles = useStyles();
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
      setNativeError('Google did not return an identity token.');
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
        accessibilityLabel="Continue with Google"
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
            {isPending ? 'Signing in…' : 'Continue with Google'}
          </ThemedText>
        </View>
        {isPending ? (
          <ActivityIndicator
            color={theme === 'dark' ? '#E3E3E3' : '#1F1F1F'}
            size="small"
            style={styles.activityIndicator}
          />
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
      height: 54,
      borderRadius: 14,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: isDark ? '#4A405F' : '#DED8EC',
      backgroundColor: isDark ? '#171321' : '#FBFAFE',
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleButtonPressed: {
      backgroundColor: isDark ? '#1B1627' : '#FFFFFF',
      borderColor: '#6654C7',
      transform: [{ scale: 0.99 }],
    },
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
      color: isDark ? '#E3E3E3' : '#1F1F1F',
      fontFamily: 'PlusJakartaSansMedium',
      fontSize: 14,
      lineHeight: 20,
    },
    activityIndicator: {
      position: 'absolute',
      right: Platform.OS === 'ios' ? 16 : 12,
    },
    errorText: {
      marginTop: -8,
      color: isDark ? '#FFAAAA' : '#9F2018',
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
    },
  });
};
