import axiosInstance from './axiosInstance';

export const authApi = {
  signIn: async (body: { email: string; password: string }) => {
    const response = await axiosInstance.post('/v1/auth/login', body);
    const data = response?.data?.results?.object;

    // Reject reader role from entering the admin dashboard
    if (data?.user?.role === 'reader') {
      const error = new Error('Bạn không có quyền truy cập vào trang quản trị.') as any;
      error.response = {
        data: {
          message: 'Bạn không có quyền truy cập vào trang quản trị.'
        }
      };
      throw error;
    }

    return data;
  },
  signOut: async () => {
    return await axiosInstance.post('/v1/auth/logout');
  },
  verify2FA: async (body: { code: string }) => {
    const response = await axiosInstance.post('/v1/auth/verify-2fa', body);
    return response?.data?.results?.object;
  },
  refreshToken(data: { refreshToken: string }) {
    return axiosInstance.post('/v1/auth/refresh-token', data);
  },
};
