import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { borrowingApi, type IBorrowingResponse, type IRenewResponse } from '../api/borrowingApi';

export const useBorrowing = () => {
  return useQuery<IBorrowingResponse>({
    queryKey: ['my-borrowing'],
    queryFn: () => borrowingApi.getCurrentBorrowing(),
    staleTime: 60_000,
  });
};

export const useRenewBorrowing = () => {
  const queryClient = useQueryClient();
  return useMutation<IRenewResponse, Error, number>({
    mutationFn: (borrowId: number) => borrowingApi.renewBorrowing(borrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-borrowing'] });
    },
  });
};
