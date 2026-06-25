import { useQuery } from '@tanstack/react-query';
import { recommendationApi, type IRecommendationResponse } from '../api/recommendationApi';

export const useRecommendations = () => {
  return useQuery<IRecommendationResponse>({
    queryKey: ['recommendations'],
    queryFn: () => recommendationApi.get(),
    staleTime: 5 * 60_000,
  });
};
