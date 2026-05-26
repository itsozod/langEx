import EmailIcon from '@/assets/images/email.svg';
import GoogleIcon from '@/assets/images/google.svg';
import ThemeToggle from '@/components/theme-toggle';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AppLogo from '@/components/ui/app-logo';
import GradientBackground from '@/components/ui/gradient-background';
import { PrimaryButton } from '@/components/ui/primary-button';
import SubTitle from '@/components/ui/sub-title';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, View } from 'tamagui';

const WelcomeScreen = () => {
  const { theme: appTheme } = useAppTheme();
  const styles = useStyles();
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={{ alignSelf: 'flex-end' }}>
          <ThemeToggle />
        </View>
        <ThemedView style={styles.heroSection}>
          <ThemedView style={styles.header}>
            <AppLogo />
            <SubTitle style={styles.subTitle}>Learn languages with real people</SubTitle>
          </ThemedView>
          <ThemedView style={styles.imageContainer}>
            <Image
              source={require('@/assets/images/language.png')}
              style={styles.languageSvg}
              contentFit="contain"
            />
            <Image
              source={require('@/assets/images/people.png')}
              style={styles.peopleImage}
              contentFit="contain"
            />
          </ThemedView>

          <ThemedView style={styles.signInContainer}>
            <Button
              icon={<GoogleIcon />}
              style={styles.googleButton}
              borderWidth={1}
              borderColor={appTheme === 'dark' ? '#928F9E' : '#C8C4D5'}
              pressStyle={{ opacity: 0.85, bg: 'transparent' }}
              hoverStyle={{ bg: 'transparent' }}>
              <ThemedText type="smallBold" style={styles.googleButtonText}>
                Continue with Google
              </ThemedText>
            </Button>
            <PrimaryButton icon={<EmailIcon />} style={styles.emailButton}>
              <ThemedText type="bold" style={{ color: '#462A00' }}>
                Continue with email
              </ThemedText>
            </PrimaryButton>
          </ThemedView>
          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
              gap: 5,
            }}>
            <ThemedText type="smallBold" style={{ fontSize: 12 }}>
              Already have an account?
            </ThemedText>
            <Link
              href={'/login'}
              style={{
                color: appTheme === 'dark' ? '#FFB95D' : '#3B309E',
                fontSize: 12,
                fontWeight: 'bold',
              }}>
              Log in
            </Link>
          </View>
          <ThemedText
            style={{
              fontSize: 10,
              color: appTheme === 'dark' ? '#E8DEF9' : '#787584',
              lineHeight: 15,
              letterSpacing: 1.8,
            }}>
            PREMIUM LANGUAGE EXCHANGE ©{new Date().getFullYear()}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const useStyles = () => {
  const { theme: appTheme } = useAppTheme();
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      paddingHorizontal: Spacing.four,
      alignItems: 'center',
      gap: Spacing.three,
      paddingTop: Spacing.three,
      paddingBottom: BottomTabInset + Spacing.three,
      maxWidth: MaxContentWidth,
    },
    heroSection: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      flex: 1,
      gap: 38,
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'transparent',
      gap: 1,
    },

    title: {
      fontSize: 32,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    subTitle: {
      fontSize: 16,
      textAlign: 'center',
    },
    imageContainer: {
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: 'transparent',
    },
    signInContainer: {
      display: 'flex',
      width: 'auto',
      flexDirection: 'column',
      backgroundColor: 'transparent',
      gap: 12,
    },
    languageSvg: {
      width: 240,
      height: 240,
      position: 'relative',
      left: 80,
    },
    googleButton: {
      borderRadius: 14,
      backgroundColor: appTheme === 'dark' ? '#151023' : '#ffffff',
      height: 52,
      width: 342,
    },

    googleButtonText: {
      color: appTheme === 'dark' ? '#E8DEF9' : '#191C1D',
    },
    emailButton: {
      fontSize: 14,
      width: 342,
      height: 52,
    },
    peopleImage: {
      width: 240,
      height: 240,
      position: 'relative',
      top: 60,
      right: 60,
    },
  });
};

export default WelcomeScreen;
