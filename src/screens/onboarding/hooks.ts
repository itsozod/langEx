import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authQueryKeys } from '@/screens/auth/hooks';
import { useAuthStore } from '@/shared/store/auth-store';

import { completeProfile, uploadAvatar } from './api';

export function useUploadAvatarMutation() {
  return useMutation({
    mutationKey: ['onboarding', 'avatar'],
    mutationFn: uploadAvatar,
  });
}

export function useCompleteProfileMutation() {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['onboarding', 'profile'],
    mutationFn: completeProfile,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(authQueryKeys.me, { user: data.user });
    },
  });
}
