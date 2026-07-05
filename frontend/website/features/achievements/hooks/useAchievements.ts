import { useQuery } from '@tanstack/react-query';
import { BaseListParams } from '@shared/types/GeneralType';
import { achievementApi } from '../api/achievementApi';
import { useMockAchievements } from '@/lib/mock/useMockAchievements';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export const useAchievements = (params: BaseListParams) => {
  // If mock mode is enabled, use mock data
  if (USE_MOCK) {
    const mockData = useMockAchievements({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    });
    return {
      data: mockData.data,
      isLoading: mockData.isLoading,
      error: mockData.error,
    };
  }

  // Otherwise, use real API
  return useQuery({
    queryKey: ['achievements', params],
    queryFn: () => achievementApi.getList(params),
  });
};
