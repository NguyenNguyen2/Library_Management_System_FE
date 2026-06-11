import { useQuery } from '@tanstack/react-query';
import { BaseListParams } from '@shared/types/GeneralType';
import { achievementApi } from '../api/achievementApi';

export const useAchievements = (params: BaseListParams) => {
  return useQuery({
    queryKey: ['achievements', params],
    queryFn: () => achievementApi.getList(params),
  });
};
