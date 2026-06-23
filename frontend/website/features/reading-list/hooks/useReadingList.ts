import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  readingListApi,
  type IReadingListResponse,
  type IAddPayload,
  type IUpdatePayload,
} from '../api/readingListApi';

const QUERY_KEY = ['my-reading-list'] as const;

export const useReadingList = () => {
  return useQuery<IReadingListResponse>({
    queryKey: QUERY_KEY,
    queryFn: () => readingListApi.getReadingList(),
    staleTime: 60_000,
  });
};

export const useAddToReadingList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IAddPayload) => readingListApi.addToReadingList(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useUpdateReadingList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IUpdatePayload) => readingListApi.updateReadingList(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useRemoveFromReadingList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (wishlistId: number) => readingListApi.removeReadingList(wishlistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};
