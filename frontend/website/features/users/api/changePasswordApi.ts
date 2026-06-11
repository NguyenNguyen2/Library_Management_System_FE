import axiosInstance from '@/lib/axios/axios-client';

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export const changePasswordApi = {
  /** POST /v1/users/change-password — requires JWT; verifies currentPassword. */
  changePassword: async (body: ChangePasswordBody) => {
    const response = await axiosInstance.post<{
      results: { object: { message: string } };
    }>('/v1/users/change-password', body);
    return response?.data?.results?.object;
  },
};
