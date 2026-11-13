import { StyleSheet } from 'react-native';

import { useAppTheme, type AppTheme } from '@/providers/theme-provider';

const createStyles = (theme: AppTheme) => {
  const isDark = theme === 'dark';

  return StyleSheet.create({
    container: {
      alignSelf: 'center',
      maxWidth: '88%',
      marginHorizontal: 18,
      marginBottom: 10,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 14,
      backgroundColor: isDark ? 'rgba(190,176,255,0.09)' : 'rgba(97,76,190,0.07)',
    },
    text: {
      color: isDark ? '#AAA2B6' : '#746D7E',
      fontSize: 11,
      lineHeight: 16,
      textAlign: 'center',
    },
  });
};

const styleSheets = new Map<AppTheme, ReturnType<typeof createStyles>>();

export function useChatSystemMessageStyles() {
  const { theme } = useAppTheme();
  const cached = styleSheets.get(theme);
  if (cached) return cached;

  const styles = createStyles(theme);
  styleSheets.set(theme, styles);
  return styles;
}
