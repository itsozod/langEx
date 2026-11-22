import { useAppTheme } from '@/providers/theme-provider';

/**
 * The app's restrained palette: near-neutral surfaces, one accent, and three text levels. Screens
 * use these instead of per-file hex values so every page shares the same visual language.
 */
const LIGHT = {
  text: '#18151F',
  muted: '#77727F',
  subtle: '#A9A4B1',
  /** Grouped-list and card fill on the page background. */
  card: '#FFFFFF',
  /** Filled controls: search fields, chips, icon buttons, secondary buttons. */
  fill: 'rgba(24,21,31,0.06)',
  fillPressed: 'rgba(24,21,31,0.04)',
  hairline: 'rgba(24,21,31,0.09)',
  accent: '#6B57D6',
  accentText: '#5F4CC9',
  onAccent: '#FFFFFF',
  danger: '#D2364B',
  success: '#2FA968',
  /** Loading spinners and pull-to-refresh: the app's purple. */
  loader: '#6654C7',
} as const;

const DARK = {
  text: '#F4F2F8',
  muted: '#9A95A6',
  subtle: '#6E6979',
  card: '#1F1D27',
  fill: 'rgba(255,255,255,0.07)',
  fillPressed: 'rgba(255,255,255,0.05)',
  hairline: 'rgba(255,255,255,0.08)',
  accent: '#7B68E0',
  accentText: '#A898FF',
  onAccent: '#FFFFFF',
  danger: '#FF6B7D',
  success: '#3DD181',
  loader: '#B8A9FF',
} as const;

export type UiTokens = { [K in keyof typeof LIGHT]: string };

export function useUiTokens(): UiTokens {
  const { theme } = useAppTheme();
  return theme === 'dark' ? DARK : LIGHT;
}

/** Font families for the Plus Jakarta Sans weights the app loads. */
export const FONT = {
  regular: 'PlusJakartaSans',
  medium: 'PlusJakartaSansMedium',
  semibold: 'PlusJakartaSansSemiBold',
  bold: 'PlusJakartaSansBold',
} as const;
