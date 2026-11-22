import { switchToSavedAccount } from '@/screens/auth/_shared/utils/session-transition';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useOnboardingStore } from '@/shared/store/onboarding-store';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';
import { useTranslation } from 'react-i18next';

// Space kept below a focused field: the Next button (52), the card gap, and a validation error.
const NEXT_BUTTON_CLEARANCE = 130;

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
  const { t } = useTranslation(['common', 'onboarding']);
  const returnAccountId = useOnboardingStore((state) => state.returnAccountId);
  const [isExiting, setIsExiting] = useState(false);

  const exitAddedAccountOnboarding = async () => {
    if (!returnAccountId || isExiting) return;

    setIsExiting(true);
    try {
      const didSwitch = await switchToSavedAccount(returnAccountId);
      if (didSwitch) {
        router.replace('/(tabs)/profile');
        return;
      }
      Alert.alert(
        t('onboarding:closeSetup.failedTitle'),
        t('onboarding:closeSetup.accountUnavailable'),
      );
    } catch {
      Alert.alert(t('onboarding:closeSetup.failedTitle'), t('errors.tryAgain'));
    } finally {
      setIsExiting(false);
    }
  };

  const exitAction = returnAccountId ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('onboarding:closeSetup.label')}
      accessibilityState={{ disabled: isExiting }}
      disabled={isExiting}
      hitSlop={10}
      onPress={() => void exitAddedAccountOnboarding()}
      style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
      <SymbolView
        name={{ ios: 'xmark', android: 'close', web: 'close' }}
        size={20}
        weight="semibold"
        tintColor={styles.icon.color}
      />
    </Pressable>
  ) : (
    headerAction
  );

  return (
    <GradientBackground>
      <KeyboardAwareScrollView
        bottomOffset={NEXT_BUTTON_CLEARANCE}
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        style={styles.keyboardView}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.topRow}>
              {onBack ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('actions.goBack')}
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
                {t('onboarding:stepOf', { step, total: 5 })}
              </ThemedText>
              <View style={styles.actionSlot}>{exitAction}</View>
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
      </KeyboardAwareScrollView>
    </GradientBackground>
  );
}

const useStyles = () => {
  const tokens = useUiTokens();

  return StyleSheet.create({
    keyboardView: { flex: 1, width: '100%' },
    scrollContent: { flexGrow: 1 },
    safeArea: {
      flexGrow: 1,
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 30,
    },
    content: { width: '100%', maxWidth: 440, gap: 24 },
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
      backgroundColor: tokens.fill,
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      backgroundColor: tokens.fill,
    },
    backPlaceholder: { width: 40, height: 40 },
    pressed: { opacity: 0.6 },
    icon: { color: tokens.text },
    stepLabel: { color: tokens.muted, fontFamily: FONT.semibold, fontSize: 13, lineHeight: 18 },
    actionSlot: { width: 64, alignItems: 'flex-end' },
    progressTrack: {
      height: 4,
      overflow: 'hidden',
      borderRadius: 2,
      backgroundColor: tokens.fill,
    },
    progressFill: { height: '100%', borderRadius: 2, backgroundColor: tokens.accent },
    heading: { gap: 8 },
    title: {
      color: tokens.text,
      fontFamily: FONT.bold,
      fontSize: 30,
      lineHeight: 36,
      letterSpacing: -0.7,
    },
    subtitle: { color: tokens.muted, fontSize: 16, lineHeight: 23 },
  });
};
