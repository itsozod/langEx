import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import '@tamagui/native/setup-expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { TamaguiProvider } from 'tamagui';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemeProvider, useAppTheme } from '@/context/ThemeContext';

import tamaguiConfig from '../../tamagui.config';

SplashScreen.preventAutoHideAsync().catch(() => {});

const isSignedIn = false;

function ThemedAppShell() {
  const { theme } = useAppTheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
      <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style="auto" />
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={isSignedIn}>
            <Stack.Screen name="(tabs)" />
          </Stack.Protected>

          <Stack.Protected guard={!isSignedIn}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
      </NavigationThemeProvider>
    </TamaguiProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    PlusJakartaSans: PlusJakartaSans_400Regular,
    PlusJakartaSansMedium: PlusJakartaSans_500Medium,
    PlusJakartaSansSemiBold: PlusJakartaSans_600SemiBold,
    PlusJakartaSansBold: PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <ThemedAppShell />
    </ThemeProvider>
  );
}
