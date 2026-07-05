import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { libraryCardRenewalApi, CardRenewalRequestItem } from '../api/libraryCardRenewalApi';

export const libraryCardRenewalHooks = {
  useRequests: () =>
    useQuery<CardRenewalRequestItem[]>({
      queryKey: ['card-renewal-requests'],
      queryFn: () => libraryCardRenewalApi.listRequests('pending'),
      staleTime: 30_000,
    }),

  useApprove: () => {
    const qc = useQueryClient();
    return useMutation<{ message: string }, AxiosError, { id: number; reviewNote?: string }>({
      mutationFn: ({ id, reviewNote }) => libraryCardRenewalApi.approve(id, reviewNote),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['card-renewal-requests'] }),
    });
  },

  useReject: () => {
    const qc = useQueryClient();
    return useMutation<{ message: string }, AxiosError, { id: number; reviewNote?: string }>({
      mutationFn: ({ id, reviewNote }) => libraryCardRenewalApi.reject(id, reviewNote),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['card-renewal-requests'] }),
    });
  },
};
