import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileAppearance } from '@/screens/profile/components/profile-appearance';
import { SettingsHeader } from '@/screens/profile/components/settings-header';
import GradientBackground from '@/shared/components/ui/gradient-background';

export default function ThemeSettingsScreen() {
  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.content}>
            <SettingsHeader
              fallbackHref="/profile/settings"
              subtitle="Choose how LangEx looks"
              title="Theme"
            />
            <ProfileAppearance />
          </View>
        </SafeAreaView>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  safeArea: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
  },
  content: { width: '100%', maxWidth: 520, gap: 20 },
});
