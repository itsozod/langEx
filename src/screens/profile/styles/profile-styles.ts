import { StyleSheet } from 'react-native';

import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';

/** Profile, settings and preference screens: open layout with grouped lists, no floating cards. */
export const useProfileStyles = () => {
  const tokens = useUiTokens();

  return StyleSheet.create({
    screen: { flex: 1, width: '100%' },
    scrollContent: { flexGrow: 1, alignItems: 'center', paddingBottom: 132 },
    safeArea: { width: '100%', alignItems: 'center', paddingHorizontal: 16 },
    content: { width: '100%', maxWidth: 560, gap: 28 },
    titleRow: {
      paddingTop: 12,
      paddingHorizontal: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    screenTitle: {
      color: tokens.text,
      fontFamily: FONT.bold,
      fontSize: 32,
      lineHeight: 38,
      letterSpacing: -0.6,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: tokens.fill,
    },
    iconButtonIcon: { color: tokens.text },
    pressed: { opacity: 0.6 },

    // Profile hero
    hero: { alignItems: 'center', gap: 4 },
    avatarButton: { marginBottom: 12 },
    editBadge: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: tokens.card,
      backgroundColor: tokens.accent,
    },
    pendingOverlay: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    displayName: {
      color: tokens.text,
      fontFamily: FONT.bold,
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.3,
      textAlign: 'center',
    },
    countryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    countryText: { color: tokens.muted, fontSize: 15, lineHeight: 20 },
    error: { color: tokens.danger, fontSize: 13, lineHeight: 18, textAlign: 'center' },
    secondaryButton: {
      marginTop: 16,
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      borderRadius: 20,
      paddingHorizontal: 18,
      backgroundColor: tokens.fill,
    },
    secondaryButtonText: { color: tokens.text, fontFamily: FONT.semibold, fontSize: 15 },

    // Language rows
    flagCircle: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 15,
      overflow: 'hidden',
      backgroundColor: tokens.fill,
    },
    languageFlagFallback: { color: tokens.muted },
    levelText: { color: tokens.muted, fontSize: 15, lineHeight: 20 },

    // Interests and bio live inside a grouped section container
    sectionBody: { padding: 16, gap: 12 },
    interests: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    interestPill: {
      minHeight: 32,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 16,
      paddingHorizontal: 12,
      backgroundColor: tokens.fill,
    },
    interestText: { color: tokens.text, fontFamily: FONT.medium, fontSize: 14, lineHeight: 18 },
    interestIconColor: { color: tokens.muted },
    bio: { color: tokens.text, fontSize: 15, lineHeight: 22 },

    // Selection rows (theme, language)
    check: { color: tokens.accentText },
  });
};
