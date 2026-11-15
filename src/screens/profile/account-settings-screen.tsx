import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/providers/theme-provider';
import { removeActiveAccount } from '@/screens/auth/_shared/utils/session-transition';
import { useDeleteAccountMutation } from '@/screens/profile/hooks';
import { SettingsHeader } from '@/screens/profile/components/settings-header';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { useTranslation } from 'react-i18next';

export default function AccountSettingsScreen() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const deleteAccount = useDeleteAccountMutation();
  const { t } = useTranslation(['profile', 'common']);

  const deleteAccountPermanently = async () => {
    try {
      await deleteAccount.mutateAsync();
      await removeActiveAccount();
    } catch (error) {
      Alert.alert(
        t('account.deleteFailed'),
        error instanceof Error ? error.message : t('common:errors.tryAgain'),
      );
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(t('account.confirmTitle'), t('account.confirmMessage'), [
      { text: t('common:actions.cancel'), style: 'cancel' },
      {
        text: t('common:actions.continue'),
        style: 'destructive',
        onPress: () =>
          Alert.alert(t('account.finalConfirmTitle'), t('account.finalConfirmMessage'), [
            { text: t('common:actions.cancel'), style: 'cancel' },
            {
              text: t('account.delete'),
              style: 'destructive',
              onPress: () => void deleteAccountPermanently(),
            },
          ]),
      },
    ]);
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.content}>
            <SettingsHeader
              fallbackHref="/profile/settings"
              subtitle={t('account.subtitle')}
              title={t('account.title')}
            />
            <View
              style={[styles.dangerCard, isDark ? styles.dangerCardDark : styles.dangerCardLight]}>
              <View style={styles.copy}>
                <ThemedText type="bold" style={styles.title}>
                  {t('account.delete')}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.description}>
                  {t('account.deleteDescription')}
                </ThemedText>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('account.deleteLabel')}
                accessibilityState={{ disabled: deleteAccount.isPending }}
                disabled={deleteAccount.isPending}
                onPress={confirmDeleteAccount}
                style={({ pressed }) => [
                  styles.deleteButton,
                  isDark && styles.deleteButtonDark,
                  pressed && styles.pressed,
                ]}>
                {deleteAccount.isPending ? (
                  <ActivityIndicator color={isDark ? '#FFAAAA' : '#B42318'} />
                ) : (
                  <SymbolView
                    name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                    size={18}
                    weight="semibold"
                    tintColor={isDark ? '#FFAAAA' : '#B42318'}
                  />
                )}
                <ThemedText style={[styles.deleteText, isDark && styles.deleteTextDark]}>
                  {deleteAccount.isPending ? t('account.deleting') : t('account.delete')}
                </ThemedText>
              </Pressable>
            </View>
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
  dangerCard: {
    gap: 20,
    padding: 20,
    borderWidth: 0,
    borderRadius: 22,
    borderCurve: 'continuous',
  },
  dangerCardLight: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 11,
        blurRadius: 26,
        spreadDistance: -8,
        color: 'rgba(54,40,113,0.14)',
      },
    ],
  },
  dangerCardDark: {
    backgroundColor: 'rgba(55,25,35,0.62)',
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 12,
        blurRadius: 28,
        spreadDistance: -8,
        color: 'rgba(0,0,0,0.42)',
      },
    ],
  },
  copy: { gap: 6 },
  title: { fontSize: 17, lineHeight: 23 },
  description: { fontSize: 13, lineHeight: 21 },
  deleteButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 17,
    borderWidth: 0,
    backgroundColor: '#FFDCD8',
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 9,
        blurRadius: 21,
        spreadDistance: -7,
        color: 'rgba(180,35,24,0.25)',
      },
    ],
  },
  deleteButtonDark: {
    backgroundColor: 'rgba(94,31,42,0.28)',
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 9,
        blurRadius: 22,
        spreadDistance: -7,
        color: 'rgba(0,0,0,0.40)',
      },
      {
        offsetX: 0,
        offsetY: 2,
        blurRadius: 9,
        spreadDistance: -5,
        color: 'rgba(255,112,125,0.18)',
      },
    ],
  },
  deleteText: { color: '#B42318', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  deleteTextDark: { color: '#FFAAAA' },
  pressed: { opacity: 0.65 },
});
