import GradientBackground from '@/shared/components/ui/gradient-background';
import { ThemedText } from '@/shared/components/ui/themed-text';
import React, { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const AuthScreen = ({ title, subtitle, children }: AuthScreenProps) => {
  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
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
        </ScrollView>
      </KeyboardAvoidingView>
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
