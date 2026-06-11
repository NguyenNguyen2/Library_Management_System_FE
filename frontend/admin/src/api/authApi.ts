import axiosInstance from './axiosInstance';

export const authApi = {
  signIn: async (body: { email: string; password: string }) => {
    const response = await axiosInstance.post('/v1/auth/login', body);
    return response?.data?.results?.object;
  },
  signOut: async () => {
    return await axiosInstance.post('/v1/auth/logout');
  },
  refreshToken(data: { refreshToken: string }) {
    return axiosInstance.post('/v1/auth/refresh-token', data);
  },
};
