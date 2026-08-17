import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import '@tamagui/native/setup-expo-linear-gradient';
import { useFonts } from 'expo-font';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  router,
  Stack,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { AnimatedSplashOverlay } from '@/shared/components/ui/animated-icon';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { ThemeProvider, useAppTheme } from '@/providers/theme-provider';
import { useAuthSessionBootstrap } from '@/screens/auth/auth-session-bootstrap';
import { AuthenticatedApiInterceptor } from '@/screens/auth/authenticated-api-interceptor';
import { ChatSocketManager } from '@/screens/chat/chat-socket-manager';
import { QueryProvider } from '@/providers/query-provider';
import { useAuthHydration, useAuthStore } from '@/shared/store/auth-store';

import tamaguiConfig from '../../tamagui.config';

SplashScreen.preventAutoHideAsync().catch(() => {});

function ThemedAppShell() {
  const { theme } = useAppTheme();
  const token = useAuthStore((state) => state.token);
  const { isUnauthorized, isVerifying, user } = useAuthSessionBootstrap();
  const isSignedIn = Boolean(token && user && !isUnauthorized);
  const isProfileComplete = user?.isProfileComplete === true;

  useEffect(() => {
    if (isVerifying) return;

    if (!isSignedIn) {
      router.replace('/welcome');
      return;
    }

    if (!isProfileComplete) {
      router.replace('/onboarding/step1');
      return;
    }

    router.replace('/(tabs)');
  }, [isProfileComplete, isSignedIn, isVerifying]);

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
      <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <AnimatedSplashOverlay />
        {isSignedIn ? <AuthenticatedApiInterceptor /> : null}
        {isSignedIn ? <ChatSocketManager /> : null}

        {isVerifying ? (
          <View style={[styles.loadingScreen, theme === 'dark' && styles.loadingScreenDark]}>
            <ActivityIndicator size="large" color="#6654C7" />
            <ThemedText themeColor="textSecondary" style={styles.loadingText}>
              Checking your session…
            </ThemedText>
          </View>
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={isSignedIn && !isProfileComplete}>
              <Stack.Screen name="onboarding" />
            </Stack.Protected>

            <Stack.Protected guard={isSignedIn && isProfileComplete}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="chat" />
            </Stack.Protected>

            <Stack.Protected guard={!isSignedIn}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
          </Stack>
        )}
      </NavigationThemeProvider>
    </TamaguiProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: '#F8F6FC',
  },
  loadingScreenDark: {
    backgroundColor: '#100D17',
  },
  loadingText: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default function RootLayout() {
  const authHydrated = useAuthHydration();
  const [fontsLoaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    PlusJakartaSans: PlusJakartaSans_400Regular,
    PlusJakartaSansMedium: PlusJakartaSans_500Medium,
    PlusJakartaSansSemiBold: PlusJakartaSans_600SemiBold,
    PlusJakartaSansBold: PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded && authHydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [authHydrated, fontsLoaded]);

  if (!fontsLoaded || !authHydrated) {
    return null;
  }

  return (
    <QueryProvider>
      <ThemeProvider>
        <ThemedAppShell />
      </ThemeProvider>
    </QueryProvider>
  );
}
