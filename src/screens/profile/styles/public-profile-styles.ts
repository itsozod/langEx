import { StyleSheet } from 'react-native';

import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';

/** Another person's profile: open hero with a primary Message action, then grouped sections. */
export function usePublicProfileStyles() {
  const tokens = useUiTokens();

  return StyleSheet.create({
    scrollContent: { flexGrow: 1, alignItems: 'center', paddingBottom: 40 },
    safeArea: { width: '100%', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4 },
    content: { width: '100%', maxWidth: 560, gap: 28 },
    pressed: { opacity: 0.7 },
    barButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      backgroundColor: tokens.fill,
    },
    barButtonIcon: { color: tokens.text },
    hero: { alignItems: 'center', gap: 4 },
    displayName: {
      marginTop: 12,
      color: tokens.text,
      fontFamily: FONT.bold,
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.3,
      textAlign: 'center',
    },
    countryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    muted: { color: tokens.muted, fontSize: 15, lineHeight: 20 },
    messageButton: {
      marginTop: 18,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 22,
      paddingHorizontal: 24,
      backgroundColor: tokens.accent,
    },
    messageButtonText: { color: tokens.onAccent, fontFamily: FONT.semibold, fontSize: 16 },
    sectionBody: { padding: 16 },
    interests: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16 },
    interestPill: {
      minHeight: 32,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 16,
      paddingHorizontal: 12,
      backgroundColor: tokens.fill,
    },
    sharedInterestPill: { backgroundColor: tokens.accent },
    interestIcon: { color: tokens.muted },
    interestText: { color: tokens.text, fontFamily: FONT.medium, fontSize: 14, lineHeight: 18 },
    sharedInterestText: { color: tokens.onAccent },
    bio: { color: tokens.text, fontSize: 15, lineHeight: 22 },
    // Loading, error and deleted states
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
    loadingText: { color: tokens.muted, fontSize: 14, lineHeight: 20 },
    errorTitle: { color: tokens.text, fontFamily: FONT.semibold, fontSize: 18, lineHeight: 24 },
    errorMessage: { maxWidth: 300, textAlign: 'center', fontSize: 14, lineHeight: 20 },
    errorButton: {
      marginTop: 10,
      minHeight: 44,
      justifyContent: 'center',
      borderRadius: 22,
      paddingHorizontal: 22,
      backgroundColor: tokens.fill,
    },
    errorButtonText: { color: tokens.text, fontFamily: FONT.semibold, fontSize: 15 },
  });
}
