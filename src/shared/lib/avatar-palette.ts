/**
 * Muted avatar colors. Each person gets a stable color derived from their name, so the list reads
 * as a set of distinct people instead of identical purple circles. Pairs are tuned for contrast
 * of the initials against their background in both themes.
 */
const PALETTE = {
  dark: [
    { background: '#3A3560', foreground: '#CFC8FF' },
    { background: '#1F4744', foreground: '#93E2D5' },
    { background: '#4A391E', foreground: '#F2C67C' },
    { background: '#4A2533', foreground: '#F4A8C0' },
    { background: '#1F3A5A', foreground: '#9CC6F5' },
    { background: '#27432C', foreground: '#A2DAA8' },
    { background: '#4C2E20', foreground: '#F3B494' },
  ],
  light: [
    { background: '#E7E4FB', foreground: '#4A3FA0' },
    { background: '#DAF1EE', foreground: '#1D6A61' },
    { background: '#FAEBD2', foreground: '#875811' },
    { background: '#FBE1E9', foreground: '#9A3355' },
    { background: '#DCE9FB', foreground: '#29599A' },
    { background: '#DFF1E1', foreground: '#2E6A37' },
    { background: '#FCE5D9', foreground: '#984822' },
  ],
} as const;

const NEUTRAL = {
  dark: { background: '#2E2C35', foreground: '#A9A5B3' },
  light: { background: '#ECEBF0', foreground: '#6E6A78' },
} as const;

export type AvatarColors = { background: string; foreground: string };

function hash(value: string) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(result);
}

/** Stable colors for a person or group. Pass `neutral` for deleted or unknown accounts. */
export function getAvatarColors(
  seed: string,
  theme: 'light' | 'dark',
  neutral = false,
): AvatarColors {
  if (neutral || !seed) return NEUTRAL[theme];
  const palette = PALETTE[theme];
  return palette[hash(seed) % palette.length];
}
