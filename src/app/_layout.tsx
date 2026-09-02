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
  useRootNavigationState,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { TamaguiProvider } from 'tamagui';

import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider, useAppTheme } from '@/providers/theme-provider';
import { switchToSavedAccount } from '@/screens/auth/_shared/utils/session-transition';
import { useAuthSessionBootstrap } from '@/screens/auth/auth-session-bootstrap';
import { AuthenticatedApiInterceptor } from '@/screens/auth/authenticated-api-interceptor';
import { ChatSocketManager } from '@/screens/chat/chat-socket-manager';
import { OutboxManager } from '@/screens/chat/outbox-manager';
import {
  type NotificationConversationTarget,
  clearLastNotificationResponse,
  PushNotificationManager,
} from '@/screens/notifications/push-notification-manager';
import { AnimatedSplashOverlay } from '@/shared/components/ui/animated-icon';
import { AccountTransitionOverlay } from '@/shared/components/ui/account-transition-overlay';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAuthHydration, useAuthStore } from '@/shared/store/auth-store';
import { useUserHydration } from '@/shared/store/user.store';

import tamaguiConfig from '../../tamagui.config';

SplashScreen.preventAutoHideAsync().catch(() => {});

function ThemedAppShell() {
  const { theme } = useAppTheme();
  const rootNavigationState = useRootNavigationState();
  const token = useAuthStore((state) => state.token);
  const [notificationTarget, setNotificationTarget] =
    useState<NotificationConversationTarget | null>(null);
  const { isUnauthorized, isVerifying, user } = useAuthSessionBootstrap();
  const isSignedIn = Boolean(token && user && !isUnauthorized);
  const isProfileComplete = user?.isProfileComplete === true;
  const routedSessionRef = useRef<string | null>(null);
  const handledNotificationIdRef = useRef<string | null>(null);

  const handleOpenNotificationConversation = useCallback(
    (target: NotificationConversationTarget) => {
      const auth = useAuthStore.getState();
      if (target.recipientUserId && target.recipientUserId !== auth.activeAccountId) {
        const hasRecipientAccount = auth.accounts.some(
          (account) => account.userId === target.recipientUserId,
        );
        if (!hasRecipientAccount) return;

        void switchToSavedAccount(target.recipientUserId).then((didSwitch) => {
          if (!didSwitch) return;
          setNotificationTarget(target);
        });
        return;
      }

      setNotificationTarget(target);
    },
    [],
  );

  useEffect(() => {
    if (isVerifying || !rootNavigationState?.key) return;

    if (!isSignedIn) {
      routedSessionRef.current = null;
      router.replace('/welcome');
      return;
    }

    if (!isProfileComplete) {
      router.replace('/onboarding/step1');
      return;
    }

    const sessionId = `${user.id}:${token}`;
    const isNewSession = routedSessionRef.current !== sessionId;
    if (isNewSession) routedSessionRef.current = sessionId;

    const hasUnhandledNotification =
      notificationTarget && handledNotificationIdRef.current !== notificationTarget.notificationId;

    if (hasUnhandledNotification) {
      router.replace({
        pathname: '/chat/[id]',
        params: { id: notificationTarget.conversationId },
      });
      handledNotificationIdRef.current = notificationTarget.notificationId;
      clearLastNotificationResponse();
      return;
    }

    if (isNewSession) router.replace('/(tabs)');
  }, [
    isProfileComplete,
    isSignedIn,
    isVerifying,
    notificationTarget,
    rootNavigationState?.key,
    token,
    user?.id,
  ]);

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
      <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <AnimatedSplashOverlay />
        {isSignedIn ? <AuthenticatedApiInterceptor /> : null}
        {isSignedIn ? <ChatSocketManager /> : null}
        {isSignedIn ? <OutboxManager /> : null}
        <PushNotificationManager
          onOpenConversation={handleOpenNotificationConversation}
          userId={isSignedIn ? user?.id : undefined}
        />

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
              <Stack.Screen name="account-auth" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="chat/[id]" />
            </Stack.Protected>

            <Stack.Protected guard={!isSignedIn}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
          </Stack>
        )}
        <AccountTransitionOverlay />
      </NavigationThemeProvider>
    </TamaguiProvider>
  );
}

const styles = StyleSheet.create({
  appRoot: { flex: 1 },
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
  const usersHydrated = useUserHydration();
  const [fontsLoaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    PlusJakartaSans: PlusJakartaSans_400Regular,
    PlusJakartaSansMedium: PlusJakartaSans_500Medium,
    PlusJakartaSansSemiBold: PlusJakartaSans_600SemiBold,
    PlusJakartaSansBold: PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded && authHydrated && usersHydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [authHydrated, fontsLoaded, usersHydrated]);

  if (!fontsLoaded || !authHydrated || !usersHydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.appRoot}>
      <KeyboardProvider preload={false}>
        <QueryProvider>
          <ThemeProvider>
            <ThemedAppShell />
          </ThemeProvider>
        </QueryProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
