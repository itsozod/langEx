import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';

/** Result rows in the full-screen people search; flat rows like the Chats list. */
export function useUserSearchStyles() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const muted = isDark ? '#9A95A6' : '#77727F';

  return StyleSheet.create({
    resultRow: {
      minHeight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingLeft: 20,
      paddingRight: 16,
      paddingVertical: 10,
    },
    resultRowPressed: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(24,21,31,0.04)',
    },
    resultCopy: { flex: 1, minWidth: 0, gap: 3 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    resultName: {
      flexShrink: 1,
      color: isDark ? '#F4F2F8' : '#18151F',
      fontFamily: 'PlusJakartaSansSemiBold',
      fontSize: 16,
      lineHeight: 21,
    },
    languageText: { color: muted, fontSize: 14, lineHeight: 19 },
    chevron: { color: isDark ? '#6E6979' : '#B3AEBB' },
  });
}
