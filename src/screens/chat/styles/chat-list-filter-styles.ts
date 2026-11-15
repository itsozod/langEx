import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';

export const ACCENT_COLOR = '#6654C7';

export const useChatListFilterStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    container: { gap: 12, paddingBottom: 18 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.10)' : '#E1DDE8',
      paddingHorizontal: 14,
      backgroundColor: isDark ? 'rgba(35,30,48,0.8)' : 'rgba(255,255,255,0.80)',
    },
    chipSelected: { backgroundColor: ACCENT_COLOR, borderColor: ACCENT_COLOR },
    chipIcon: { color: isDark ? '#C3BDCE' : '#665F70' },
    chipText: {
      color: isDark ? '#C3BDCE' : '#665F70',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
    chipTextSelected: { color: '#FFFFFF' },
    onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2FBF71' },
    pressed: { opacity: 0.75 },
  });
};
