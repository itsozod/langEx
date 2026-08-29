import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';
import type { AuthUser } from '@/screens/auth/types';
import { getInitials } from '@/screens/profile/utils/language-flags';
import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

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
  const styles = useStyles();

  const completedUsers = users.filter((user) => user.isProfileComplete);

  return (
    <View style={styles.card}>
      <ThemedText type="bold" style={styles.title}>
        Accounts
      </ThemedText>
      <View>
        {completedUsers.map((user, index) => {
          const isActive = user.id === activeAccountId;
          const isSwitching = user.id === switchingAccountId;
          const displayName = user.displayName?.trim() || 'LangEx account';

          return (
            <View key={user.id}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  isActive ? `${displayName}, active account` : `Switch to ${displayName}`
                }
                accessibilityState={{ selected: isActive, disabled: Boolean(switchingAccountId) }}
                disabled={isActive || Boolean(switchingAccountId)}
                onPress={() => onSwitchAccount(user.id)}
                style={({ pressed }) => [
                  styles.accountRow,
                  isActive && styles.activeAccountRow,
                  pressed && styles.pressed,
                ]}>
                {user.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    contentFit="cover"
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <ThemedText style={styles.initials}>
                      {getInitials(user.displayName, user.email)}
                    </ThemedText>
                  </View>
                )}
                <View style={styles.accountCopy}>
                  <ThemedText type="bold" numberOfLines={1} style={styles.accountName}>
                    {displayName}
                  </ThemedText>
                  <ThemedText
                    themeColor="textSecondary"
                    numberOfLines={1}
                    style={styles.accountEmail}>
                    {user.email}
                  </ThemedText>
                </View>
                {isSwitching ? (
                  <ActivityIndicator color="#7460D3" />
                ) : isActive ? (
                  <View style={styles.activeBadge}>
                    <SymbolView
                      name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                      size={15}
                      weight="bold"
                      tintColor="#FFFFFF"
                    />
                  </View>
                ) : (
                  <SymbolView
                    name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                    size={18}
                    weight="semibold"
                    tintColor={styles.chevron.color}
                  />
                )}
              </Pressable>
            </View>
          );
        })}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add account"
          disabled={Boolean(switchingAccountId)}
          onPress={() => router.push('/account-auth/login')}
          style={({ pressed }) => [styles.addRow, pressed && styles.pressed]}>
          <View style={styles.addIcon}>
            <SymbolView
              name={{ ios: 'plus', android: 'add', web: 'add' }}
              size={22}
              weight="semibold"
              tintColor={styles.addText.color}
            />
          </View>
          <ThemedText style={styles.addText}>Add account</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function useStyles() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    card: {
      overflow: 'hidden',
      borderRadius: 22,
      borderCurve: 'continuous',
      paddingTop: 18,
      paddingHorizontal: 12,
      backgroundColor: isDark ? '#1D1828' : '#FFFFFF',
      boxShadow: isDark ? '0 12px 28px rgba(0,0,0,0.30)' : '0 11px 26px rgba(54,40,113,0.10)',
    },
    title: { paddingHorizontal: 8, paddingBottom: 9, fontSize: 15, lineHeight: 21 },
    accountRow: {
      minHeight: 70,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderRadius: 17,
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    activeAccountRow: { backgroundColor: isDark ? '#272035' : '#F5F1FC' },
    pressed: { opacity: 0.68 },
    avatar: { width: 48, height: 48, borderRadius: 18, borderCurve: 'continuous' },
    avatarFallback: {
      width: 48,
      height: 48,
      borderRadius: 18,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#55488A' : '#E7E0FF',
    },
    initials: { color: isDark ? '#F2EEFF' : '#5948A9', fontSize: 15, fontWeight: '700' },
    accountCopy: { flex: 1, minWidth: 0, gap: 1 },
    accountName: { fontSize: 14, lineHeight: 20 },
    accountEmail: { fontSize: 11, lineHeight: 16 },
    activeBadge: {
      width: 27,
      height: 27,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6654C7',
    },
    chevron: { color: isDark ? '#817989' : '#9A92A2' },
    divider: {
      height: StyleSheet.hairlineWidth,
      marginLeft: 68,
      backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : '#E8E3ED',
    },
    addRow: {
      minHeight: 62,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 8,
    },
    addIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
    addText: { color: isDark ? '#BEB0FF' : '#5B49B8', fontSize: 14, fontWeight: '700' },
  });
}
