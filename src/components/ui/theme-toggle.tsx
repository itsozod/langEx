import { Button } from 'tamagui';

import { useAppTheme } from '@/context/ThemeContext';

const LABELS = {
  system: '🖥️ System',
  light: '☀️ Light',
  dark: '🌙 Dark',
} as const;

export function ThemeToggle() {
  const { preference, cyclePreference } = useAppTheme();

  return (
    <Button onPress={cyclePreference} size="$4" px="$4" rounded="$6">
      {LABELS[preference]}
    </Button>
  );
}

export default ThemeToggle;
