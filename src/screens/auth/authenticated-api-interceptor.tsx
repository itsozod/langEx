import { useEffect } from 'react';

import { setUnauthorizedHandler } from '@/shared/lib/api-client';
import { queryClient } from '@/providers/query-provider';
import { useAuthStore } from '@/shared/store/auth-store';
import { useChatStore } from '@/shared/store/chatStore';
import { useOnboardingStore } from '@/shared/store/onboardingStore';

export function AuthenticatedApiInterceptor() {
  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.clear();
      useChatStore.getState().reset();
      useOnboardingStore.getState().reset();
      useAuthStore.getState().clearSession();
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  return null;
}
