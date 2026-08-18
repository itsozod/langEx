import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authQueryKeys } from '@/screens/auth/hooks';
import { getMe } from '@/screens/auth/api';
import type { AuthUser, MeResponse } from '@/screens/auth/types';
import { uploadAvatar } from '@/screens/onboarding/api';
import { useAuthStore } from '@/shared/store/auth-store';

import { removeAvatar, updateProfile } from './api';

function useSyncAuthUser() {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return (user: AuthUser) => {
    setUser(user);
    queryClient.setQueryData<MeResponse>(authQueryKeys.me, { user });
  };
}

export function useUpdateProfileMutation() {
  const syncUser = useSyncAuthUser();

  return useMutation({
    mutationKey: ['profile', 'update'],
    mutationFn: updateProfile,
    onSuccess: (data) => syncUser(data.user),
  });
}

export function useChangeAvatarMutation() {
  const syncUser = useSyncAuthUser();

  return useMutation({
    mutationKey: ['profile', 'avatar', 'upload'],
    mutationFn: uploadAvatar,
    onSuccess: ({ avatarUrl }) => {
      const user = useAuthStore.getState().user;
      if (user) syncUser({ ...user, avatarUrl });
    },
  });
}

export function useRemoveAvatarMutation() {
  const syncUser = useSyncAuthUser();

  return useMutation({
    mutationKey: ['profile', 'avatar', 'remove'],
    mutationFn: removeAvatar,
    onSuccess: (data) => syncUser(data.user),
  });
}

export function useRefreshProfileMutation() {
  const syncUser = useSyncAuthUser();

  return useMutation({
    mutationKey: ['profile', 'refresh'],
    mutationFn: getMe,
    onSuccess: (data) => syncUser(data.user),
  });
}
