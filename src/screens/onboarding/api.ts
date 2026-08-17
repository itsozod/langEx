import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

import type { AuthUser } from '@/screens/auth/types';
import { apiClient, apiRequest } from '@/shared/lib/api-client';
import type { OnboardingData } from '@/shared/store/onboardingStore';

type AvatarResponse = {
  avatarUrl: string;
};

type ProfileResponse = {
  user: AuthUser;
};

const getFileName = (asset: ImagePickerAsset) => {
  if (asset.fileName) return asset.fileName;

  const extension = asset.mimeType?.split('/')[1] ?? 'jpg';
  return `avatar.${extension}`;
};

export async function uploadAvatar(asset: ImagePickerAsset) {
  const formData = new FormData();
  const fileName = getFileName(asset);

  if (Platform.OS === 'web') {
    const fileResponse = await fetch(asset.uri);
    const blob = await fileResponse.blob();
    formData.append('avatar', blob, fileName);
  } else {
    formData.append('avatar', {
      uri: asset.uri,
      name: fileName,
      type: asset.mimeType ?? 'image/jpeg',
    } as unknown as Blob);
  }

  const response = await apiClient.post<AvatarResponse>('/users/avatar', formData);
  return response.data;
}

export function completeProfile(data: OnboardingData) {
  return apiRequest<ProfileResponse>('/users/profile', {
    method: 'PATCH',
    body: data,
  });
}
