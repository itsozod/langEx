import { StyleSheet } from 'react-native';

import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';

/** Edit Profile: an open form on the page background, labels above filled inputs. */
export function useEditProfileStyles() {
  const tokens = useUiTokens();

  return StyleSheet.create({
    keyboardView: { flex: 1, width: '100%' },
    scrollContent: { flexGrow: 1 },
    safeArea: {
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 32,
    },
    content: { width: '100%', maxWidth: 560, gap: 20 },
    formCard: { gap: 24, paddingHorizontal: 4 },
    pressed: { opacity: 0.7 },
    field: { gap: 8 },
    labelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
    label: { color: tokens.text, fontFamily: FONT.semibold, fontSize: 14, lineHeight: 19 },
    characterCount: { color: tokens.muted, fontSize: 12, lineHeight: 16 },
    textArea: {
      minHeight: 112,
      borderRadius: 12,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: 'transparent',
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 12,
      backgroundColor: tokens.fill,
      color: tokens.text,
      fontFamily: FONT.regular,
      fontSize: 16,
      lineHeight: 22,
    },
    placeholder: { color: tokens.subtle },
    inputError: { borderColor: tokens.danger },
    error: { color: tokens.danger, fontSize: 13, lineHeight: 18 },
    levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    interestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    interestPill: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 18,
      paddingHorizontal: 14,
      backgroundColor: tokens.fill,
    },
    interestPillSelected: { backgroundColor: tokens.text },
    interestText: { color: tokens.text, fontFamily: FONT.medium, fontSize: 14, lineHeight: 18 },
    interestTextSelected: { color: tokens.card },
    serverError: {
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: tokens.fill,
    },
    serverErrorText: { color: tokens.danger, fontSize: 14, lineHeight: 20 },
  });
}
