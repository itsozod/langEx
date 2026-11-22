import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';

/** Result rows in the full-screen chat search; they mirror the Chats list rows. */
export const useChatSearchStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    row: {
      minHeight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingLeft: 20,
      paddingRight: 10,
      paddingVertical: 10,
    },
    rowPressed: { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(24,21,31,0.04)' },
    copy: { flex: 1, minWidth: 0, gap: 3 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: {
      flexShrink: 1,
      color: isDark ? '#F4F2F8' : '#18151F',
      fontFamily: 'PlusJakartaSansSemiBold',
      fontSize: 16,
      lineHeight: 21,
    },
    highlight: { color: isDark ? '#A898FF' : '#5F4CC9' },
    meta: { color: isDark ? '#9A95A6' : '#77727F', fontSize: 14, lineHeight: 19 },
    actions: { flexDirection: 'row' },
    actionButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    actionButtonDisabled: { opacity: 0.35 },
    actionIcon: { color: isDark ? '#C9C5D2' : '#4A4652' },
  });
};
