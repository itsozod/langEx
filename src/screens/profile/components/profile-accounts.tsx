import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import type { AuthUser } from '@/screens/auth/types';
import { ContactAvatar } from '@/shared/components/ui/contact-avatar';
import { ListRow, ListSection } from '@/shared/components/ui/grouped-list';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { useUiTokens } from '@/shared/hooks/use-ui-tokens';

/** Separator inset for rows that start with a 36pt avatar (16 padding + avatar + 12 gap). */
const AVATAR_ROW_INSET = 64;

type ProfileAccountsProps = {
  users: AuthUser[];
  activeAccountId: string;
  switchingAccountId: string | null;
  onSwitchAccount: (userId: string) => void;
};

export function ProfileAccounts({
  users,
  activeAccountId,
  switchingAccountId,
  onSwitchAccount,
}: ProfileAccountsProps) {
  const tokens = useUiTokens();
  const { t } = useTranslation('profile');
  const completedUsers = users.filter((user) => user.isProfileComplete);

  return (
    <ListSection title={t('accounts.title')} inset={AVATAR_ROW_INSET}>
      {completedUsers.map((user) => {
        const isActive = user.id === activeAccountId;
        const isSwitching = user.id === switchingAccountId;
        const displayName = user.displayName?.trim() || t('accounts.fallbackName');

        return (
          <ListRow
            key={user.id}
            accessibilityLabel={
              isActive
                ? t('accounts.activeLabel', { name: displayName })
                : t('accounts.switchTo', { name: displayName })
            }
            disabled={Boolean(switchingAccountId) && !isSwitching}
            leading={<ContactAvatar avatarUrl={user.avatarUrl} name={displayName} size={36} />}
            onPress={isActive ? undefined : () => onSwitchAccount(user.id)}
            showChevron={false}
            subtitle={user.email}
            title={displayName}
            trailing={
              isSwitching ? (
                <ActivityIndicator color={tokens.loader} />
              ) : isActive ? (
                <SymbolView
                  name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                  size={17}
                  weight="semibold"
                  tintColor={tokens.accentText}
                />
              ) : undefined
            }
          />
        );
      })}
      <ListRow
        disabled={Boolean(switchingAccountId)}
        leading={
          <View style={[styles.addIcon, { backgroundColor: tokens.fill }]}>
            <SymbolView
              name={{ ios: 'plus', android: 'add', web: 'add' }}
              size={17}
              weight="semibold"
              tintColor={tokens.accentText}
            />
          </View>
        }
        onPress={() => router.push('/account-auth/login')}
        showChevron={false}
        title={t('accounts.add')}
      />
    </ListSection>
  );
}

const styles = StyleSheet.create({
  addIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
