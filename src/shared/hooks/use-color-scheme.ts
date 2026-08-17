import { useAppTheme } from '@/providers/theme-provider';

export function useColorScheme(): 'light' | 'dark' {
  return useAppTheme().theme;
}
