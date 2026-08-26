import { Platform, StyleSheet } from 'react-native';

import { useAppTheme, type AppTheme } from '@/providers/theme-provider';

const createChatThreadStyles = (theme: AppTheme) => {
  const isDark = theme === 'dark';
  const border = isDark ? 'rgba(190,176,255,0.13)' : 'rgba(97,76,190,0.10)';

  return StyleSheet.create({
    typingIndicator: {
      width: 50,
      height: 30,
      marginLeft: 14,
      marginBottom: 6,
      paddingHorizontal: 11,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 15,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      backgroundColor: isDark ? '#302A3D' : '#FFFFFF',
    },
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? '#BEB0FF' : '#6654C7',
    },
    jumpToLatest: { position: 'absolute', right: 14, bottom: 10 },
    jumpToLatestButton: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 24,
      backgroundColor: '#6654C7',
      shadowColor: '#2E2168',
      shadowOpacity: 0.28,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    newMessageBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 20,
      height: 20,
      paddingHorizontal: 5,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: isDark ? '#181420' : '#F8F6FC',
      backgroundColor: '#E95D8F',
      color: '#FFFFFF',
      fontSize: 10,
      lineHeight: 16,
      fontWeight: '800',
      textAlign: 'center',
      overflow: 'hidden',
      zIndex: 1,
      elevation: 5,
    },
    emptyChat: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 34,
      ...Platform.select({
        ios: { transform: [{ scaleY: -1 }] },
        android: { transform: [{ scale: -1 }] },
      }),
    },
    emptyTitle: { fontSize: 17, lineHeight: 23, textAlign: 'center' },
    emptyMessage: { marginTop: 6, fontSize: 12, lineHeight: 19, textAlign: 'center' },
  });
};

export function useChatThreadStyles() {
  const { theme } = useAppTheme();
  return createChatThreadStyles(theme);
}
