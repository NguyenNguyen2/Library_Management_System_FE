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

/** Step 1 — verify current password and request OTP email. */
export const useRequestChangePassword = () => {
  return useMutation({
    mutationFn: changePasswordApi.requestOtp,
  });
};

/** Step 2 — verify OTP and apply the new password. */
export const useVerifyChangePasswordOtp = () => {
  return useMutation({
    mutationFn: changePasswordApi.verifyOtp,
  });
};
