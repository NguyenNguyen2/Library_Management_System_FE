import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  borrowingApi,
  type IBorrowingResponse,
  type IBorrowRenewalRequestResponse,
  type IBorrowHistoryResponse,
} from '../api/borrowingApi';

export const useBorrowing = () => {
  return useQuery<IBorrowingResponse>({
    queryKey: ['my-borrowing'],
    queryFn: () => borrowingApi.getCurrentBorrowing(),
    staleTime: 60_000,
  });
};

export const useBorrowHistory = () => {
  return useQuery<IBorrowHistoryResponse>({
    queryKey: ['my-borrow-history'],
    queryFn: () => borrowingApi.getHistory(),
    staleTime: 60_000,
  });
};

export const useRenewBorrowing = () => {
  const queryClient = useQueryClient();
  return useMutation<IBorrowRenewalRequestResponse, Error, number>({
    mutationFn: (borrowId: number) => borrowingApi.submitRenewalRequest(borrowId),
    onSuccess: () => {
      // Refresh danh sách để hiển thị trạng thái renewal_pending = true
      queryClient.invalidateQueries({ queryKey: ['my-borrowing'] });
    },
  });
};

// Reader tự hủy yêu cầu gia hạn sách khi còn Pending.
export const useCancelRenewBorrowing = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (borrowId: number) => borrowingApi.cancelRenewalRequest(borrowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-borrowing'] });
    },
  });
};
