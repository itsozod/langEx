import GradientBackground from '@/shared/components/ui/gradient-background';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { useAppTheme } from '@/providers/theme-provider';
import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OnboardingScreenProps = {
  step: 1 | 2 | 3 | 4 | 5;
  title: string;
  subtitle: string;
  children: ReactNode;
  onBack?: () => void;
  headerAction?: ReactNode;
};

export function OnboardingScreen({
  step,
  title,
  subtitle,
  children,
  onBack,
  headerAction,
}: OnboardingScreenProps) {
  const styles = useStyles();

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              <View style={styles.topRow}>
                {onBack ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    hitSlop={10}
                    onPress={onBack}
                    style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
                    <SymbolView
                      name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                      size={21}
                      weight="semibold"
                      tintColor={styles.icon.color}
                    />
                  </Pressable>
                ) : (
                  <View style={styles.backPlaceholder} />
                )}
                <ThemedText themeColor="textSecondary" style={styles.stepLabel}>
                  Step {step} of 5
                </ThemedText>
                <View style={styles.actionSlot}>{headerAction}</View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${step * 20}%` }]} />
              </View>

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
}

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
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
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 30,
    },
    content: {
      width: '100%',
      maxWidth: 440,
      gap: 22,
    },
    topRow: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.76)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(91,70,176,0.10)',
    },
    backPlaceholder: {
      width: 40,
      height: 40,
    },
    pressed: {
      opacity: 0.6,
    },
    icon: {
      color: isDark ? '#F0EAF9' : '#302A3A',
    },
    stepLabel: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '600',
    },
    actionSlot: {
      width: 64,
      alignItems: 'flex-end',
    },
    progressTrack: {
      height: 5,
      overflow: 'hidden',
      borderRadius: 999,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(91,70,176,0.10)',
    },
    progressFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: '#6654C7',
    },
    heading: {
      gap: 8,
    },
    title: {
      fontSize: 31,
      lineHeight: 39,
      letterSpacing: -0.7,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 22,
    },
  });
};
