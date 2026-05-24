import { defaultConfig } from '@tamagui/config/v5';
import { createFont, createTamagui, createTokens } from 'tamagui';

const jakartaFont = createFont({
  family: 'PlusJakartaSans',
  size: defaultConfig.fonts.body.size,
  lineHeight: defaultConfig.fonts.body.lineHeight,
  weight: defaultConfig.fonts.body.weight,
  letterSpacing: defaultConfig.fonts.body.letterSpacing,
  face: {
    400: { normal: 'PlusJakartaSans' },
    500: { normal: 'PlusJakartaSansMedium' },
    600: { normal: 'PlusJakartaSansSemiBold' },
    700: { normal: 'PlusJakartaSansBold' },
  },
});

const tokens = createTokens({
  ...defaultConfig.tokens,

  color: {
    primaryOrange: '#FFB95D',
    primaryOrangePressed: '#D88A1A',
    primaryOrangeHover: '#F5A93A',
    primaryOrangeText: '#462A00',
  },
});

export const config = createTamagui({
  ...defaultConfig,
  tokens,
  fonts: {
    ...defaultConfig.fonts,
    body: jakartaFont,
    heading: jakartaFont,
  },
});

export default config;

export type AppTamaguiConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

declare module '@tamagui/web' {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}
