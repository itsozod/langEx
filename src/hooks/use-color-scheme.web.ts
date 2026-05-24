import { useEffect, useState } from 'react';

import { useAppTheme } from '@/context/ThemeContext';

export function useColorScheme(): 'light' | 'dark' {
  const { theme } = useAppTheme();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated ? theme : 'light';
}
