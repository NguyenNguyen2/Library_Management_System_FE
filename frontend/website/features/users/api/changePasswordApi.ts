import axiosInstance from '@/lib/axios/axios-client';

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface VerifyChangePasswordBody {
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const changePasswordApi = {
  /** POST /v1/profile/change-password/request — verify current password → send OTP email */
  requestOtp: async (body: ChangePasswordBody): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/v1/profile/change-password/request', {
      current_password:          body.currentPassword,
      new_password:              body.newPassword,
      new_password_confirmation: body.confirmNewPassword,
    });
    return response?.data;
  },

  /** POST /v1/profile/change-password/verify — verify OTP → apply new password */
  verifyOtp: async (body: VerifyChangePasswordBody): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/v1/profile/change-password/verify', {
      otp:                       body.otp,
      new_password:              body.newPassword,
      new_password_confirmation: body.confirmNewPassword,
    });
    return response?.data;
  },
};
