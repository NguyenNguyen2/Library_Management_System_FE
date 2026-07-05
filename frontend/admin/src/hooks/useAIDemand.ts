import { useQuery } from '@tanstack/react-query';
import { aiDemandApi } from '../api/aiDemandApi';
import { QueryKey } from '../constants/queryKey';

export const aiDemandHooks = {
  useImportSuggestions: () =>
    useQuery({
      queryKey: [QueryKey.aiDemand.importSuggestions],
      queryFn:  () => aiDemandApi.getImportSuggestions(),
      staleTime: 60 * 60 * 1000, // 1 hour
    }),

  useLowBorrowBooks: () =>
    useQuery({
      queryKey: [QueryKey.aiDemand.lowBorrowBooks],
      queryFn:  () => aiDemandApi.getLowBorrowBooks(),
      staleTime: 60 * 60 * 1000,
    }),

  useSeasonalDemand: (year: number) =>
    useQuery({
      queryKey: [QueryKey.aiDemand.seasonalDemand, year],
      queryFn:  () => aiDemandApi.getSeasonalDemand(year),
      staleTime: 60 * 60 * 1000,
      enabled: year > 2000,
    }),
};
