import axiosInstance from './axiosInstance';
import {
  IDashboardData,
  IRecentActivitiesPage,
} from '../types/DashboardType';
import { DetailResponseType, BaseListParams } from '@shared/types/GeneralType';

export const dashboardApi = {
  /** Stats + charts. Wrapped by TransformInterceptor into `results.object`. */
  getDashboardData: async (): Promise<IDashboardData> => {
    const response = await axiosInstance.get<
      DetailResponseType<IDashboardData>
    >('/private/v1/dashboard');
    return response?.data?.results?.object;
  },

  /**
   * Paginated recent activities. Backend returns `{ rows, total, page, limit }`
   * → interceptor wraps as `results.objects`.
   */
  getRecentActivities: async (
    params: BaseListParams,
  ): Promise<IRecentActivitiesPage> => {
    const response = await axiosInstance.get<{
      results: { objects: IRecentActivitiesPage };
    }>('/private/v1/dashboard/recent-activities', { params });
    return response?.data?.results?.objects;
  },
};
