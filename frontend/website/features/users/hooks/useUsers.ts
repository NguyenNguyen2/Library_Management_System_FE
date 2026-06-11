import { useMutation } from '@tanstack/react-query';
import { IDetailUser } from '@shared/types/UserType';
import { userApi } from '../api/userApi';
import { changePasswordApi } from '../api/changePasswordApi';

/** Update current user's profile (name, avatar, …). */
export const useUpdateUser = () => {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<IDetailUser> }) =>
      userApi.updateUser(id, body),
  });
};

/** Change current user's password (requires proving the current one). */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePasswordApi.changePassword,
  });
};
