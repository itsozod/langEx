import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppLogo from '@/shared/components/ui/app-logo';
import GradientBackground from '@/shared/components/ui/gradient-background';
import ThemeToggle from '@/shared/components/ui/theme-toggle';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';

import AuthPrimaryButton from './_shared/components/auth-primary-button';

const WelcomeScreen = () => {
  const styles = useStyles();
  const { t } = useTranslation('auth');

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.topBar}>
              <AppLogo />
              <ThemeToggle />
            </View>

            <View style={styles.hero}>
              {/* Two tilted tiles (tilt and shadow are baked into the art) overlapping as a pair:
                  a conversation photo with the translate symbol tucked against its corner. */}
              <View accessible={false} style={styles.collage}>
                <Image
                  contentFit="contain"
                  source={require('@/assets/images/people.png')}
                  style={styles.photoTile}
                />
                <Image
                  contentFit="contain"
                  source={require('@/assets/images/language.png')}
                  style={styles.languageTile}
                />
              </View>
              <ThemedText accessibilityRole="header" style={styles.title}>
                {t('welcome.title')}
              </ThemedText>
              <ThemedText style={styles.subtitle}>{t('welcome.subtitle')}</ThemedText>
            </View>

            <View style={styles.actions}>
              <AuthPrimaryButton
                label={t('welcome.createAccount')}
                onPress={() => router.push('/register')}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/login')}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                <ThemedText style={styles.secondaryButtonText}>
                  {t('welcome.haveAccount')}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </GradientBackground>
  );
};

const useStyles = () => {
  const tokens = useUiTokens();

  return StyleSheet.create({
    scrollContent: { flexGrow: 1 },
    safeArea: {
      flexGrow: 1,
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 24,
    },
    content: { width: '100%', maxWidth: 440, flexGrow: 1, justifyContent: 'space-between' },
    topBar: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    hero: { gap: 12, paddingVertical: 24 },
    // Sized near the art's native resolution so the tiles stay sharp. The PNGs carry transparent
    // padding, so offsets are tuned to what's visible: the translate tile overlaps the photo's
    // lower-left corner by ~30pt and the pair is centered as one group.
    collage: { alignSelf: 'center', width: 320, maxWidth: '100%', height: 232, marginBottom: 20 },
    photoTile: { position: 'absolute', top: -8, right: 20, width: 214, height: 230 },
    languageTile: { position: 'absolute', left: 40, bottom: 0, width: 142, height: 151 },
    title: {
      color: tokens.text,
      fontFamily: FONT.bold,
      fontSize: 36,
      lineHeight: 42,
      letterSpacing: -1,
    },
    subtitle: { color: tokens.muted, fontSize: 17, lineHeight: 25 },
    actions: { gap: 10 },
    secondaryButton: {
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      borderCurve: 'continuous',
      backgroundColor: tokens.fill,
    },
    secondaryButtonText: { color: tokens.text, fontFamily: FONT.semibold, fontSize: 16 },
    pressed: { opacity: 0.7 },
  });
};

export default WelcomeScreen;
