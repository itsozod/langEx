import GradientBackground from '@/shared/components/ui/gradient-background';
import AppLogo from '@/shared/components/ui/app-logo';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { useTheme } from '@/shared/hooks/use-theme';
import { router } from 'expo-router';
import React, { type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import {
  initialWindowMetrics,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

// Space below the final focused field must include the forgot/helper row, a two-line dynamic
// server error, form gaps, the complete 54dp action, and breathing room above tall Android
// keyboards. Keeping this on the shared auth screen protects login, registration, and reset flows.
const AUTH_SUBMIT_CLEARANCE = 240;

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  dismissible?: boolean;
};

const AuthScreen = ({ title, subtitle, children, dismissible = false }: AuthScreenProps) => {
  const theme = useTheme();
  const modalHeaderStyles = useModalHeaderStyles();

  return (
    <GradientBackground>
      <View style={styles.screenColumn}>
        {dismissible ? (
          <View style={modalHeaderStyles.safeArea}>
            <View style={modalHeaderStyles.row}>
              <View style={modalHeaderStyles.side} />
              <AppLogo />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close add account"
                hitSlop={12}
                onPress={() => router.dismissTo('/(tabs)/profile')}
                style={({ pressed }) => [
                  modalHeaderStyles.closeButton,
                  pressed && modalHeaderStyles.pressed,
                ]}>
                <SymbolView
                  name={{ ios: 'xmark', android: 'close', web: 'close' }}
                  size={22}
                  weight="semibold"
                  tintColor={theme.text}
                />
              </Pressable>
            </View>
          </View>
        ) : null}
        <KeyboardAwareScrollView
          bottomOffset={AUTH_SUBMIT_CLEARANCE}
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="always"
          mode="layout"
          showsVerticalScrollIndicator={false}
          style={styles.keyboardView}>
          <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
            <View style={styles.content}>
              <View style={styles.heading}>
                <ThemedText type="title" style={styles.title}>
                  {title}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                  {subtitle}
                </ThemedText>
              </View>
              {children}
            </View>
          </SafeAreaView>
        </KeyboardAwareScrollView>
      </View>
    </GradientBackground>
  );
};

function useModalHeaderStyles() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, initialWindowMetrics?.insets.top ?? 0);

  return StyleSheet.create({
    safeArea: {
      position: 'absolute',
      zIndex: 1,
      top: 0,
      left: 0,
      right: 0,
      paddingTop: topInset,
      backgroundColor: theme === 'dark' ? '#2B2440' : '#F2EFFF',
    },
    row: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
    side: { width: 40, height: 40 },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.72)',
    },
    pressed: { opacity: 0.6 },
  });
}

const styles = StyleSheet.create({
  screenColumn: {
    flex: 1,
    width: '100%',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  safeArea: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 440,
    gap: 24,
  },
  heading: {
    gap: 8,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  subtitle: {
    maxWidth: 380,
    fontSize: 15,
    lineHeight: 23,
  },
});

export default AuthScreen;
