import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { QueryKey } from '../constants/queryKey';
import { BaseListParams } from '@shared/types/GeneralType';

export const dashboardHooks = {
  // ─── Legacy ───────────────────────────────────────────────────────────
  useFetchDashboard: () =>
    useQuery({
      queryKey: [QueryKey.dashboard.data],
      queryFn: () => dashboardApi.getDashboardData(),
      staleTime: 30_000,
    }),

  useFetchRecentActivities: (params: BaseListParams) =>
    useQuery({
      queryKey: [QueryKey.dashboard.data, 'recent-activities', params],
      queryFn: () => dashboardApi.getRecentActivities(params),
    }),

  // ─── Analytics ────────────────────────────────────────────────────────
  useSummary: () =>
    useQuery({
      queryKey: ['dashboard-summary'],
      queryFn: () => dashboardApi.getSummary(),
      staleTime: 30_000,
      refetchInterval: 60_000,
    }),

  useBorrowStats: (range: '7d' | '30d' | '90d' = '30d') =>
    useQuery({
      queryKey: ['dashboard-borrows', range],
      queryFn: () => dashboardApi.getBorrowStats(range),
      staleTime: 30_000,
    }),

  useTopBooks: () =>
    useQuery({
      queryKey: ['dashboard-top-books'],
      queryFn: () => dashboardApi.getTopBooks(),
      staleTime: 60_000,
    }),

  useOverdueList: () =>
    useQuery({
      queryKey: ['dashboard-overdue'],
      queryFn: () => dashboardApi.getOverdueList(),
      staleTime: 30_000,
    }),
};
