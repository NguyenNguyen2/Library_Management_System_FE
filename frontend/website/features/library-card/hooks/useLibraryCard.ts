import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  libraryCardApi,
  type ILibraryCard,
  type ICardRenewalRequest,
  type ISubmitCardRenewalResponse,
} from '../api/libraryCardApi';

export const useGetLibraryCard = (userId: string) => {
  return useQuery<ILibraryCard>({
    queryKey: ['library-card', userId],
    queryFn: () => libraryCardApi.getCard(userId),
    enabled: !!userId,
    retry: false,
  });
};

export const useGetMyCardRenewalRequests = () => {
  return useQuery<{ data: ICardRenewalRequest[] }>({
    queryKey: ['my-card-renewal-requests'],
    queryFn: () => libraryCardApi.getMyRenewalRequests(),
  });
};

export const useSubmitCardRenewal = () => {
  const queryClient = useQueryClient();
  return useMutation<ISubmitCardRenewalResponse, Error, void>({
    mutationFn: () => libraryCardApi.submitRenewalRequest(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-card-renewal-requests'] });
    },
  });
};

// Reader tự hủy yêu cầu gia hạn thẻ khi còn Pending.
export const useCancelCardRenewal = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (requestId: number) => libraryCardApi.cancelRenewalRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-card-renewal-requests'] });
    },
  });
};
