import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';

export function useGroupManagementStyles() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';
  const surface = isDark ? '#211C2D' : '#FFFFFF';
  const surfaceMuted = isDark ? '#302A3E' : '#F2EFF8';
  const border = isDark ? 'rgba(190,176,255,0.14)' : 'rgba(97,76,190,0.11)';
  const danger = isDark ? '#FF9AA4' : '#B42318';

  return {
    colorScheme: theme,
    containerColor: surface,
    styles: StyleSheet.create({
      sheetContent: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 28, gap: 9 },
      sheetHeader: { paddingHorizontal: 4, paddingBottom: 9, gap: 3 },
      sheetTitle: { fontSize: 19, lineHeight: 26 },
      sheetSubtitle: { fontSize: 12, lineHeight: 18 },
      actionButton: {
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: border,
        borderRadius: 17,
        borderCurve: 'continuous',
        paddingHorizontal: 13,
        backgroundColor: surfaceMuted,
      },
      actionButtonPressed: { opacity: 0.66 },
      actionButtonDisabled: { opacity: 0.45 },
      actionIcon: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderCurve: 'continuous',
        backgroundColor: isDark ? '#443A5B' : '#E8E2FF',
      },
      actionIconDanger: { backgroundColor: isDark ? 'rgba(255,106,120,0.14)' : '#FFE9E7' },
      actionIconColor: { color: isDark ? '#C5B9FF' : '#5846AA' },
      actionLabel: { flex: 1, fontSize: 14, lineHeight: 20 },
      actionLabelDanger: { color: danger },
      actionSpinner: { marginHorizontal: 7 },
      error: {
        borderRadius: 14,
        borderCurve: 'continuous',
        paddingHorizontal: 13,
        paddingVertical: 10,
        backgroundColor: isDark ? 'rgba(255,106,120,0.12)' : '#FFE9E7',
      },
      errorText: { color: isDark ? '#FFB0B8' : '#8F1D14', fontSize: 11, lineHeight: 17 },
      leaveSection: { paddingTop: 22, gap: 8 },
      leaveButton: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,154,164,0.35)' : 'rgba(180,35,24,0.22)',
        borderRadius: 17,
        borderCurve: 'continuous',
        backgroundColor: isDark ? 'rgba(255,106,120,0.10)' : '#FFF5F4',
      },
      leaveText: { color: danger, fontSize: 14, lineHeight: 20 },
      ownerNotice: { textAlign: 'center', fontSize: 11, lineHeight: 17, paddingHorizontal: 18 },
      dangerIcon: { color: danger },
    }),
  };
}
