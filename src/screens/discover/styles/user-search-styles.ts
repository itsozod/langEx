import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';

export function useUserSearchStyles() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    resultRow: {
      minHeight: 82,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(190,176,255,0.12)' : 'rgba(97,76,190,0.09)',
      backgroundColor: isDark ? 'rgba(38,32,52,0.94)' : '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      borderRadius: 21,
      borderCurve: 'continuous',
      paddingHorizontal: 13,
      paddingVertical: 11,
    },
    resultRowPressed: { backgroundColor: isDark ? '#292233' : '#F0ECF6' },
    avatarWrap: { width: 58, height: 58 },
    avatar: { width: 58, height: 58, borderRadius: 21, borderCurve: 'continuous' },
    avatarPlaceholder: {
      width: 58,
      height: 58,
      borderRadius: 21,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#55488A' : '#E7E0FF',
    },
    initials: { color: isDark ? '#F2EEFF' : '#5948A9', fontSize: 18, fontWeight: '700' },
    flagBadge: {
      position: 'absolute',
      left: -5,
      bottom: -4,
      width: 25,
      height: 25,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: isDark ? '#262034' : '#FFFFFF',
      backgroundColor: isDark ? '#302A3E' : '#FFFFFF',
    },
    resultCopy: { flex: 1, minWidth: 0, gap: 4 },
    resultName: { fontSize: 16, lineHeight: 22 },
    languageLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    languageText: { fontSize: 11, lineHeight: 16 },
    arrow: { color: isDark ? '#817989' : '#9A92A2', fontSize: 11, lineHeight: 16 },
    chevron: { color: isDark ? '#817989' : '#9A92A2' },
  });
}
