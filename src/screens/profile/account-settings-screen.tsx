import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { removeActiveAccount } from '@/screens/auth/_shared/utils/session-transition';
import { useDeleteAccountMutation } from '@/screens/profile/hooks';
import { SettingsHeader } from '@/screens/profile/components/settings-header';
import GradientBackground from '@/shared/components/ui/gradient-background';
import { ICON_ROW_INSET, ListRow, ListSection } from '@/shared/components/ui/grouped-list';
import { useUiTokens } from '@/shared/hooks/use-ui-tokens';
import { useTranslation } from 'react-i18next';

import { useSettingsPageStyles } from './styles/settings-page-styles';

export default function AccountSettingsScreen() {
  const styles = useSettingsPageStyles();
  const tokens = useUiTokens();
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
            <SettingsHeader fallbackHref="/profile/settings" title={t('account.title')} />
            <ListSection footer={t('account.deleteDescription')} inset={ICON_ROW_INSET}>
              <ListRow
                accessibilityLabel={t('account.deleteLabel')}
                destructive
                disabled={deleteAccount.isPending}
                icon={{ ios: 'trash', android: 'delete', web: 'delete' }}
                onPress={confirmDeleteAccount}
                title={deleteAccount.isPending ? t('account.deleting') : t('account.delete')}
                trailing={
                  deleteAccount.isPending ? <ActivityIndicator color={tokens.danger} /> : undefined
                }
              />
            </ListSection>
          </View>
        </SafeAreaView>
      </ScrollView>
    </GradientBackground>
  );
}
