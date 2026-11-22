import { StyleSheet } from 'react-native';

/** Shared page frame for settings screens (settings, theme, language, account). */
export const useSettingsPageStyles = () =>
  StyleSheet.create({
    scrollContent: { flexGrow: 1, alignItems: 'center' },
    safeArea: {
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 36,
    },
    content: { width: '100%', maxWidth: 560, gap: 24 },
  });
