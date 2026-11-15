import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';

import { ACCENT_COLOR } from './chat-list-filter-styles';

export const useChatSearchStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  return StyleSheet.create({
    row: {
      minHeight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderRadius: 18,
      borderCurve: 'continuous',
      paddingLeft: 12,
      paddingRight: 6,
      paddingVertical: 10,
      backgroundColor: isDark ? 'rgba(38,32,52,0.94)' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(190,176,255,0.12)' : 'rgba(97,76,190,0.09)',
    },
    rowPressed: { opacity: 0.75 },
    avatarWrap: { width: 48, height: 48 },
    avatar: { width: 48, height: 48, borderRadius: 24 },
    avatarPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#55488A' : '#E8E2FF',
    },
    groupAvatar: { borderRadius: 17 },
    avatarIcon: { color: isDark ? '#E6DEFF' : ACCENT_COLOR },
    initials: { color: isDark ? '#FFFFFF' : '#5140A8', fontSize: 16, lineHeight: 21 },
    // Same badges as the Chats list rows (online dot bottom-right, country flag bottom-left).
    onlineDot: {
      position: 'absolute',
      right: -2,
      bottom: 1,
      width: 14,
      height: 14,
      zIndex: 2,
      elevation: 2,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: isDark ? '#262034' : '#FFFFFF',
      backgroundColor: '#35B879',
    },
    countryBadge: {
      position: 'absolute',
      left: -3,
      bottom: -2,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isDark ? '#262034' : '#FFFFFF',
      backgroundColor: isDark ? '#302A3E' : '#FFFFFF',
    },
    copy: { flex: 1, minWidth: 0, gap: 2 },
    name: { fontSize: 15, lineHeight: 20 },
    highlight: { color: isDark ? '#C9BEFF' : ACCENT_COLOR },
    meta: { fontSize: 12, lineHeight: 17 },
    actions: { flexDirection: 'row', gap: 4 },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#2A2338' : '#EEEAFB',
    },
    actionButtonDisabled: { opacity: 0.4 },
    actionIcon: { color: isDark ? '#C9BEFF' : ACCENT_COLOR },
  });
};
