import GradientBackground from '@/shared/components/ui/gradient-background';
import { ThemedText } from '@/shared/components/ui/themed-text';
import React, { type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

const AUTH_SUBMIT_CLEARANCE = 150;

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const AuthScreen = ({ title, subtitle, children }: AuthScreenProps) => {
  return (
    <GradientBackground>
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
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
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
