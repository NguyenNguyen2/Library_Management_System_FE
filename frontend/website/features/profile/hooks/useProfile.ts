import { useMutation, useQuery } from '@tanstack/react-query';
import { profileApi, IProfileData } from '../api/profileApi';

export const useGetProfile = (userId: string) => {
  return useQuery<IProfileData>({
    queryKey: ['profile', userId],
    queryFn: () => profileApi.getProfile(userId),
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: string;
      body: { full_name: string; phone?: string | null; address?: string | null };
    }) => profileApi.updateProfile(userId, body),
  });
};

export const useUploadAvatar = () => {
  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      profileApi.uploadAvatar(userId, file),
  });
};
