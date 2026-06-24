import axiosInstance from './axiosInstance';
import {
  IDashboardData,
  IDashboardSummary,
  IBorrowStats,
  ITopBooksData,
  IOverdueData,
  IRecentActivitiesPage,
} from '../types/DashboardType';
import { BaseListParams } from '@shared/types/GeneralType';

export const dashboardApi = {
  // Legacy — keeps inventory + old chart data working
  getDashboardData: async (): Promise<IDashboardData> => {
    const res = await axiosInstance.get('/private/v1/dashboard');
    return res?.data?.results?.object;
  },

  getRecentActivities: async (params: BaseListParams): Promise<IRecentActivitiesPage> => {
    const res = await axiosInstance.get('/private/v1/dashboard/recent-activities', { params });
    return res?.data?.results?.objects;
  },

  // Analytics endpoints
  getSummary: async (): Promise<IDashboardSummary> => {
    const res = await axiosInstance.get('/private/v1/dashboard/summary');
    return res?.data?.results?.object;
  },

  getBorrowStats: async (range: '7d' | '30d' | '90d' = '30d'): Promise<IBorrowStats> => {
    const res = await axiosInstance.get('/private/v1/dashboard/borrows', { params: { range } });
    return res?.data?.results?.object;
  },

  getTopBooks: async (): Promise<ITopBooksData> => {
    const res = await axiosInstance.get('/private/v1/dashboard/top-books');
    return res?.data?.results?.object;
  },

  getOverdueList: async (): Promise<IOverdueData> => {
    const res = await axiosInstance.get('/private/v1/dashboard/overdue');
    return res?.data?.results?.object;
  },
};
