import { useQuery } from '@tanstack/react-query';
import { historyApi, UserHistoryResponse } from '../api/historyApi';

export const historyHooks = {
  useUserHistory: (userId: number | null) =>
    useQuery<UserHistoryResponse>({
      queryKey: ['user-history', userId],
      queryFn: () => historyApi.getUserHistory(userId!),
      enabled: userId !== null && userId > 0,
      staleTime: 30_000,
    }),
};
