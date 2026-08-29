import { useEffect } from 'react';

import { setUnauthorizedHandler } from '@/shared/lib/api-client';

import { removeInvalidActiveAccount } from './_shared/utils/session-transition';

export function AuthenticatedApiInterceptor() {
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void removeInvalidActiveAccount();
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  return null;
}
