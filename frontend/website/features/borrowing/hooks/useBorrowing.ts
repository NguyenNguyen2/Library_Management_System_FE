import { useQuery } from '@tanstack/react-query';
import { borrowingApi, type IBorrowingResponse } from '../api/borrowingApi';

export const useBorrowing = () => {
  return useQuery<IBorrowingResponse>({
    queryKey: ['my-borrowing'],
    queryFn: () => borrowingApi.getCurrentBorrowing(),
    staleTime: 60_000,
  });
};
