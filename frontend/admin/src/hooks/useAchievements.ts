import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { achievementApi } from '../api/achievementApi';
import { QueryKey } from '../constants/queryKey';
import {
  BaseListParams,
  ListResponseTypeObject,
} from '@shared/types/GeneralType';
import {
  ICreateAchievement,
  IDetailAchievement,
  IListAchievement,
  IUpdateAchievement,
} from '@frontend/shared/src/types/AchievementType';

export const achievementHooks = {
  useFetchListAchievements: (params: BaseListParams) => {
    return useQuery({
      queryKey: [QueryKey.achievements.list, params],
      queryFn: () => achievementApi.getListAchievements(params),
    });
  },

  useFetchDetailAchievement: (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: [QueryKey.achievements.detail, id],
      enabled: !!id && enabled,
      queryFn: () => achievementApi.getAchievementDetail(id),
    });
  },

  useCreateAchievement: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailAchievement,
      AxiosError,
      { body: ICreateAchievement; params: BaseListParams }
    >({
      mutationFn: achievementApi.createAchievement,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QueryKey.achievements.list],
        });
      },
    });
  },

  useUpdateAchievement: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailAchievement,
      AxiosError,
      {
        id: string;
        body: IUpdateAchievement;
        index: number;
        params: BaseListParams;
      }
    >({
      mutationFn: achievementApi.updateAchievement,
      onSuccess: (updated, { index, params }) => {
        queryClient.setQueryData<ListResponseTypeObject<IListAchievement>>(
          [QueryKey.achievements.list, params],
          (old) => {
            if (!old?.rows?.[index]) return old;
            const rows = [...old.rows];
            rows[index] = { ...rows[index], ...updated } as IListAchievement;
            return { ...old, rows };
          }
        );
      },
    });
  },

  useDeleteAchievement: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailAchievement,
      AxiosError,
      { id: string; params: BaseListParams }
    >({
      mutationFn: achievementApi.deleteAchievement,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QueryKey.achievements.list],
        });
      },
    });
  },
};
