import axiosInstance from '@/lib/axios/axios-client';

export const codeApi = {
  activate: async (body: { code: string }) => {
    const response = await axiosInstance.post('/v1/codes/activate', body);
    return response?.data?.results?.object;
  },
};
