import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';

import { CHAT_HEADER_HEIGHT } from '../constants';

export function useChatHeaderStyles() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,21,31,0.08)';

  return StyleSheet.create({
    header: {
      height: CHAT_HEADER_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: border,
      backgroundColor: isDark ? 'rgba(18,17,23,0.94)' : 'rgba(252,252,253,0.96)',
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 7,
    },
    pressed: { opacity: 0.65 },
    headerIcon: { color: isDark ? '#F3F2F6' : '#312C3C' },
    headerProfileButton: {
      flex: 1,
      minWidth: 0,
      height: '100%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    deleteConversationButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(24,21,31,0.06)',
    },
    deleteConversationIcon: { color: isDark ? '#FF6B7D' : '#D2364B' },
    headerCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
    headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    headerName: { flexShrink: 1, fontSize: 16, lineHeight: 21 },
    presenceRow: { minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 5 },
    onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#35B879' },
    onlineText: { color: isDark ? '#9A95A6' : '#77727F', fontSize: 12, lineHeight: 16 },
    onlineTextActive: { color: isDark ? '#79DDAA' : '#18794E', fontWeight: '600' },
  });
}
