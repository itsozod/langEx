import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';

const GUTTER = 20;
const AVATAR_SIZE = 52;
const AVATAR_GAP = 14;
const ACCENT = '#7B68E0';

/** Where row separators start: aligned with the text column, as in native chat lists. */
export const CHAT_ROW_TEXT_INSET = GUTTER + AVATAR_SIZE + AVATAR_GAP;

export const useChatsStyles = () => {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const text = isDark ? '#F4F2F8' : '#18151F';
  const muted = isDark ? '#9A95A6' : '#77727F';
  const hairline = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(24,21,31,0.08)';
  const surface = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(24,21,31,0.04)';

  return StyleSheet.create({
    safeArea: { flex: 1, width: '100%' },
    content: {
      flexGrow: 1,
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      paddingBottom: 120,
    },
    // Header, search, and chips keep the page gutter; rows run edge to edge for the press state.
    listHeader: { paddingHorizontal: GUTTER },
    header: {
      paddingTop: 12,
      paddingBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      color: text,
      fontFamily: 'PlusJakartaSansBold',
      fontSize: 32,
      lineHeight: 38,
      letterSpacing: -0.6,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: surface,
    },
    headerButtonIcon: { color: text },
    headerButtonPressed: { opacity: 0.6 },
    row: {
      minHeight: 76,
      flexDirection: 'row',
      alignItems: 'center',
      gap: AVATAR_GAP,
      paddingHorizontal: GUTTER,
      paddingVertical: 10,
    },
    rowPressed: { backgroundColor: surface },
    avatarWrap: { width: AVATAR_SIZE, height: AVATAR_SIZE },
    avatarPressed: { opacity: 0.7 },
    rowCopy: { flex: 1, minWidth: 0, gap: 3 },
    rowTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    nameGroup: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: {
      flexShrink: 1,
      color: text,
      fontFamily: 'PlusJakartaSansSemiBold',
      fontSize: 16,
      lineHeight: 21,
    },
    nameUnread: { fontFamily: 'PlusJakartaSansBold' },
    timestamp: { color: muted, fontSize: 12, lineHeight: 16 },
    timestampUnread: {
      color: isDark ? '#A898FF' : '#5F4CC9',
      fontFamily: 'PlusJakartaSansSemiBold',
    },
    rowBottom: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    preview: { flex: 1, color: muted, fontSize: 14, lineHeight: 19 },
    previewUnread: { color: isDark ? '#D9D5E2' : '#3D3946' },
    unreadBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      paddingHorizontal: 6,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: ACCENT,
    },
    unreadText: {
      color: '#FFFFFF',
      fontFamily: 'PlusJakartaSansBold',
      fontSize: 11,
      lineHeight: 14,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      marginLeft: CHAT_ROW_TEXT_INSET,
      backgroundColor: hairline,
    },
    stateCard: {
      marginTop: 56,
      marginHorizontal: GUTTER,
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    stateIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      backgroundColor: surface,
    },
    stateIconColor: { color: muted },
    stateTitle: { color: text, fontSize: 17, lineHeight: 23, marginBottom: 6 },
    stateMessage: { maxWidth: 280, textAlign: 'center', fontSize: 14, lineHeight: 20 },
    retryButton: {
      marginTop: 20,
      borderRadius: 999,
      paddingHorizontal: 18,
      paddingVertical: 10,
      backgroundColor: ACCENT,
    },
    retryText: {
      color: '#FFFFFF',
      fontFamily: 'PlusJakartaSansSemiBold',
      fontSize: 14,
      lineHeight: 19,
    },
    skeletonList: {},
    skeletonRow: {
      minHeight: 76,
      flexDirection: 'row',
      alignItems: 'center',
      gap: AVATAR_GAP,
      paddingHorizontal: GUTTER,
      paddingVertical: 10,
    },
    skeletonAvatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
    },
    skeletonCopy: { flex: 1, gap: 9 },
    skeletonName: { width: '42%', height: 13, borderRadius: 7 },
    skeletonPreview: { width: '72%', height: 11, borderRadius: 6 },
  });
};
