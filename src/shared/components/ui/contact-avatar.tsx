import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';
import { getAvatarColors } from '@/shared/lib/avatar-palette';

import { SymbolView } from './symbol-view';
import { ThemedText } from './themed-text';

type ContactAvatarProps = {
  /** Display name: used for initials and to pick a stable avatar color. */
  name: string;
  avatarUrl?: string | null;
  variant?: 'person' | 'group' | 'deleted';
  isOnline?: boolean;
  size?: number;
};

function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}

/** Round avatar shared by chat lists and people search: photo, colored initials, or an icon. */
export function ContactAvatar({
  name,
  avatarUrl,
  variant = 'person',
  isOnline = false,
  size = 52,
}: ContactAvatarProps) {
  const { theme } = useAppTheme();
  const colors = getAvatarColors(name, theme, variant === 'deleted');
  const circle = { width: size, height: size, borderRadius: size / 2 };
  const dotSize = Math.round(size * 0.27);

  return (
    <View style={{ width: size, height: size }}>
      {variant === 'person' && avatarUrl ? (
        <Image source={{ uri: avatarUrl }} contentFit="cover" style={circle} />
      ) : (
        <View style={[styles.placeholder, circle, { backgroundColor: colors.background }]}>
          {variant === 'person' ? (
            <ThemedText
              style={[
                styles.initials,
                { color: colors.foreground, fontSize: size * 0.35, lineHeight: size * 0.43 },
              ]}>
              {initialsOf(name)}
            </ThemedText>
          ) : (
            <SymbolView
              name={
                variant === 'group'
                  ? { ios: 'person.2.fill', android: 'group', web: 'group' }
                  : { ios: 'person.fill', android: 'person', web: 'person' }
              }
              size={Math.round(size * 0.42)}
              tintColor={colors.foreground}
            />
          )}
        </View>
      )}
      {isOnline ? (
        <View
          style={[
            styles.onlineDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              borderColor: theme === 'dark' ? '#17141F' : '#FAF9FC',
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: 'PlusJakartaSansSemiBold' },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 1,
    borderWidth: 2.5,
    backgroundColor: '#34C477',
  },
});
