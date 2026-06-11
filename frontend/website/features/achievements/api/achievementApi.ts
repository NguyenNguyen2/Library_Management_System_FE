import axiosInstance from '@/lib/axios/axios-client';
import { BaseListParams } from '@shared/types/GeneralType';

export const achievementApi = {
  getList: async (params: BaseListParams) => {
    const response = await axiosInstance.get('/v1/achievements', { params });
    return response?.data?.results?.objects;
  },
};
