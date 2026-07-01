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
