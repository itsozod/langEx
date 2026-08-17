import AppLogo from '@/shared/components/ui/app-logo';
import GradientBackground from '@/shared/components/ui/gradient-background';
import ThemeToggle from '@/shared/components/ui/theme-toggle';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useAppTheme } from '@/providers/theme-provider';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'tamagui';
import AuthPrimaryButton from './_shared/components/auth-primary-button';

const WelcomeScreen = () => {
  const styles = useStyles();

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.topBar}>
              <AppLogo />
              <ThemeToggle />
            </View>

            <View style={styles.heroCopy}>
              <View style={styles.eyebrow}>
                <View style={styles.eyebrowDot} />
                <ThemedText style={styles.eyebrowText}>LANGUAGE EXCHANGE, REIMAGINED</ThemedText>
              </View>
              <ThemedText type="title" style={styles.title}>
                Speak more.{`\n`}Connect for real.
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                Practice with real people, build confidence, and turn every conversation into
                progress.
              </ThemedText>
            </View>

            <View style={styles.visualCard}>
              <View style={styles.glowOne} />
              <View style={styles.glowTwo} />
              <Image
                source={require('@/assets/images/language.png')}
                style={styles.languageImage}
                contentFit="contain"
              />
              <Image
                source={require('@/assets/images/people.png')}
                style={styles.peopleImage}
                contentFit="contain"
              />
              <View style={styles.progressPill}>
                <View style={styles.onlineDot} />
                <ThemedText style={styles.progressText}>
                  Real conversations. Real progress.
                </ThemedText>
              </View>
            </View>

            <View style={styles.actions}>
              <AuthPrimaryButton
                label="Create your account"
                onPress={() => router.push('/register')}
              />
              <Button
                height={54}
                rounded={15}
                borderWidth={1}
                style={styles.secondaryButton}
                pressStyle={{ opacity: 0.72, scale: 0.99 }}
                onPress={() => router.push('/login')}>
                <ThemedText type="bold" style={styles.secondaryButtonText}>
                  I already have an account
                </ThemedText>
              </Button>
            </View>

            <ThemedText themeColor="textSecondary" style={styles.footerText}>
              Learn together. Grow together.
            </ThemedText>
          </View>
        </SafeAreaView>
      </ScrollView>
    </GradientBackground>
  );
};

const useStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
    },
    safeArea: {
      flexGrow: 1,
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 28,
    },
    content: {
      width: '100%',
      maxWidth: 440,
      flexGrow: 1,
      gap: 24,
    },
    topBar: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    heroCopy: {
      gap: 12,
      paddingTop: 4,
    },
    eyebrow: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: isDark ? 'rgba(158, 140, 255, 0.10)' : 'rgba(102, 84, 199, 0.08)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(183, 169, 255, 0.18)' : 'rgba(102, 84, 199, 0.12)',
    },
    eyebrowDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#FFB95D',
    },
    eyebrowText: {
      color: isDark ? '#C9BEFF' : '#5B49B8',
      fontSize: 9,
      lineHeight: 12,
      fontWeight: '700',
      letterSpacing: 0.8,
    },
    title: {
      fontSize: 38,
      lineHeight: 45,
      letterSpacing: -1.2,
    },
    subtitle: {
      maxWidth: 395,
      fontSize: 15,
      lineHeight: 23,
    },
    visualCard: {
      height: 270,
      overflow: 'hidden',
      borderRadius: 28,
      backgroundColor: isDark ? 'rgba(31, 25, 47, 0.86)' : 'rgba(255, 255, 255, 0.82)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(151, 134, 219, 0.22)' : 'rgba(91, 70, 176, 0.10)',
      shadowColor: isDark ? '#000000' : '#3B309E',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.22 : 0.08,
      shadowRadius: 28,
      elevation: 4,
    },
    glowOne: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 90,
      top: -70,
      right: -35,
      backgroundColor: isDark ? 'rgba(112, 91, 210, 0.20)' : 'rgba(112, 91, 210, 0.12)',
    },
    glowTwo: {
      position: 'absolute',
      width: 150,
      height: 150,
      borderRadius: 75,
      bottom: -70,
      left: -35,
      backgroundColor: isDark ? 'rgba(255, 185, 93, 0.10)' : 'rgba(255, 185, 93, 0.14)',
    },
    languageImage: {
      position: 'absolute',
      width: 205,
      height: 205,
      left: -2,
      top: 4,
      transform: [{ rotate: '-4deg' }],
    },
    peopleImage: {
      position: 'absolute',
      width: 220,
      height: 220,
      right: -4,
      bottom: 2,
      transform: [{ rotate: '3deg' }],
    },
    progressPill: {
      position: 'absolute',
      left: 18,
      right: 18,
      bottom: 16,
      minHeight: 42,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 14,
      backgroundColor: isDark ? 'rgba(21, 17, 31, 0.90)' : 'rgba(255, 255, 255, 0.92)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(91, 70, 176, 0.10)',
    },
    onlineDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#43B581',
    },
    progressText: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '600',
    },
    actions: {
      gap: 11,
    },
    secondaryButton: {
      borderColor: isDark ? '#4A405F' : '#D8D1E8',
      backgroundColor: isDark ? 'rgba(23, 19, 33, 0.74)' : 'rgba(255, 255, 255, 0.72)',
    },
    secondaryButtonText: {
      color: isDark ? '#EEE9F8' : '#332D3E',
      fontSize: 14,
    },
    footerText: {
      textAlign: 'center',
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 0.3,
    },
  });
};

export default WelcomeScreen;
