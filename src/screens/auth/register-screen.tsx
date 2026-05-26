import GradientBackground from '@/components/ui/gradient-background';
import SubTitle from '@/components/ui/sub-title';
import Title from '@/components/ui/title';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RegisterForm from './_shared/components/register-form';

const RegisterScreen = () => {
  return (
    <GradientBackground>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
        <Title style={styles.title}>Join LangEx</Title>
        <SubTitle style={styles.subTitle}>
          Start your premium language journey {'\n'} today.
        </SubTitle>
        <RegisterForm />
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.five,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
  },
  subTitle: {
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'center',
  },
});

export default RegisterScreen;
