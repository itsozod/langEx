import { useEffect, useState } from 'react';

import { useAppTheme } from '@/providers/theme-provider';

export function useColorScheme(): 'light' | 'dark' {
  const { theme } = useAppTheme();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated ? theme : 'light';
}
