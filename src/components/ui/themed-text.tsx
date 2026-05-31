import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const jakarta = (weight: 400 | 500 | 600 | 700) =>
  ({
    400: 'PlusJakartaSans',
    500: 'PlusJakartaSansMedium',
    600: 'PlusJakartaSansSemiBold',
    700: 'PlusJakartaSansBold',
  })[weight];

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'bold'
    | 'subtitle'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'bold' && styles.bold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: jakarta(500),
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: jakarta(500),
  },
  bold: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: jakarta(700),
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: jakarta(400),
  },
  title: {
    fontSize: 48,
    lineHeight: 52,
    fontFamily: jakarta(600),
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontFamily: jakarta(400),
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
    fontFamily: jakarta(400),
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
    fontFamily: jakarta(400),
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
