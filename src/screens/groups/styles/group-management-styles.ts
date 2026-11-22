import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/providers/theme-provider';
import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';

/** Member actions sheet and the Leave group action on Group info. */
export function useGroupManagementStyles() {
  const { theme } = useAppTheme();
  const tokens = useUiTokens();

  return {
    colorScheme: theme,
    containerColor: tokens.card,
    styles: StyleSheet.create({
      sheetContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 28, gap: 8 },
      sheetHeader: { paddingHorizontal: 4, paddingBottom: 8, gap: 2 },
      sheetTitle: { color: tokens.text, fontFamily: FONT.bold, fontSize: 20, lineHeight: 26 },
      sheetSubtitle: { color: tokens.muted, fontSize: 14, lineHeight: 19 },
      actionButton: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: 14,
        borderCurve: 'continuous',
        paddingHorizontal: 14,
        backgroundColor: tokens.fill,
      },
      actionButtonPressed: { opacity: 0.6 },
      actionButtonDisabled: { opacity: 0.4 },
      actionIcon: { width: 24, alignItems: 'center', justifyContent: 'center' },
      actionIconDanger: {},
      actionIconColor: { color: tokens.text },
      actionLabel: { flex: 1, color: tokens.text, fontFamily: FONT.medium, fontSize: 16 },
      actionLabelDanger: { color: tokens.danger },
      actionSpinner: { marginHorizontal: 4 },
      error: {
        borderRadius: 12,
        borderCurve: 'continuous',
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: tokens.fill,
      },
      errorText: { color: tokens.danger, fontSize: 13, lineHeight: 18 },
      leaveSection: { paddingTop: 28, paddingHorizontal: 20, gap: 8 },
      leaveButton: {
        minHeight: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 14,
        borderCurve: 'continuous',
        backgroundColor: tokens.fill,
      },
      leaveText: { color: tokens.danger, fontFamily: FONT.semibold, fontSize: 16 },
      ownerNotice: {
        color: tokens.muted,
        textAlign: 'center',
        fontSize: 13,
        lineHeight: 18,
        paddingHorizontal: 12,
      },
      dangerIcon: { color: tokens.danger },
    }),
  };
}
