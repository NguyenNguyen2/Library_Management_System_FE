import { useQuery } from '@tanstack/react-query';
import { collaborativeApi, type IRecommendationResponse } from '../api/recommendationApi';

export const useCollaborativeRecommendations = () => {
  return useQuery<IRecommendationResponse>({
    queryKey: ['recommendations', 'collaborative'],
    queryFn: () => collaborativeApi.get(),
    staleTime: 5 * 60_000,
  });
};
