import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppVersion } from '@/screens/profile/components/app-version';
import { SettingsHeader } from '@/screens/profile/components/settings-header';
import { SettingsNavigationRow } from '@/screens/profile/components/settings-navigation-row';
import GradientBackground from '@/shared/components/ui/gradient-background';

export default function ProfileSettingsScreen() {
  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.content}>
            <SettingsHeader
              fallbackHref="/(tabs)/profile"
              subtitle="Manage your profile preferences"
              title="Profile settings"
            />

            <SettingsNavigationRow
              accessibilityHint="Opens security and account deletion options"
              icon={{
                ios: 'person.crop.circle',
                android: 'account_circle',
                web: 'account_circle',
              }}
              onPress={() => router.push('/profile/account')}
              subtitle="Security and account deletion"
              title="Account"
            />

            <SettingsNavigationRow
              accessibilityHint="Opens theme choices"
              icon={{ ios: 'paintpalette', android: 'palette', web: 'palette' }}
              onPress={() => router.push('/profile/theme')}
              subtitle="System, light, or dark appearance"
              title="Theme"
            />

            <AppVersion />
          </View>
        </SafeAreaView>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
  },
  content: { width: '100%', maxWidth: 520, gap: 20 },
});
