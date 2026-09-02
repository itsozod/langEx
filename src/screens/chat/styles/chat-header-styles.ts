import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';

import { CHAT_HEADER_HEIGHT } from '../constants';

export function useChatHeaderStyles() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const border = isDark ? 'rgba(190,176,255,0.13)' : 'rgba(97,76,190,0.10)';

  return StyleSheet.create({
    header: {
      height: CHAT_HEADER_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: border,
      backgroundColor: isDark ? 'rgba(25,21,35,0.94)' : 'rgba(250,249,253,0.96)',
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 7,
    },
    pressed: { opacity: 0.65 },
    headerIcon: { color: isDark ? '#F5F1FF' : '#312C3C' },
    headerProfileButton: {
      flex: 1,
      minWidth: 0,
      height: '100%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    deleteConversationButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      borderCurve: 'continuous',
      backgroundColor: isDark ? 'rgba(255,106,120,0.12)' : '#FFE9E7',
    },
    deleteConversationIcon: { color: isDark ? '#FF9AA4' : '#B42318' },
    headerAvatarWrap: { width: 42, height: 42 },
    avatar: { width: 42, height: 42, borderRadius: 21 },
    avatarPlaceholder: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#55488A' : '#E8E2FF',
    },
    headerCountryBadge: {
      position: 'absolute',
      right: -3,
      bottom: -2,
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      borderWidth: 2,
      borderColor: isDark ? '#191523' : '#FAF9FD',
      backgroundColor: isDark ? '#302A3E' : '#FFFFFF',
    },
    initials: { color: isDark ? '#F2EEFF' : '#5846AA', fontSize: 12, lineHeight: 17 },
    headerCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
    headerName: { fontSize: 15, lineHeight: 20 },
    presenceRow: { minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 5 },
    onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#35B879' },
    onlineText: { color: isDark ? '#9F96AD' : '#7A7285', fontSize: 10, lineHeight: 15 },
    onlineTextActive: { color: isDark ? '#79DDAA' : '#18794E', fontWeight: '600' },
  });
}
