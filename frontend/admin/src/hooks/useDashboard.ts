import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { QueryKey } from '../constants/queryKey';
import { BaseListParams } from '@shared/types/GeneralType';

export const dashboardHooks = {
  useFetchDashboard: () => {
    return useQuery({
      queryKey: [QueryKey.dashboard.data],
      queryFn: () => dashboardApi.getDashboardData(),
    });
  },

  useFetchRecentActivities: (params: BaseListParams) => {
    return useQuery({
      queryKey: [QueryKey.dashboard.data, 'recent-activities', params],
      queryFn: () => dashboardApi.getRecentActivities(params),
    });
  },
};
