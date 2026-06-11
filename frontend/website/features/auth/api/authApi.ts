import axiosInstance from '@/lib/axios/axios-client';

export const authApi = {
  signIn: async (body: { email: string; password: string }) => {
    const response = await axiosInstance.post('/v1/auth/login', body);
    console.log('response', response);
    return response?.data?.results?.object;
  },
  signOut: async () => {
    return await axiosInstance.post('/v1/auth/logout');
  },
};
