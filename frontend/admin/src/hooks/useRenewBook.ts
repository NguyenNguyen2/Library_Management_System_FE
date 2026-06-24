import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  renewApi,
  BorrowedBooksRenewResponse,
  RenewBookPayload,
  RenewBookResult,
  RenewListResponse,
} from '../api/renewApi';
import type { ReturnReaderInfo } from '../api/returnApi';
import { returnApi } from '../api/returnApi';

export const renewHooks = {
  useSearchReader: () =>
    useMutation<ReturnReaderInfo[], AxiosError, string>({
      mutationFn: returnApi.searchReader,
    }),

  useGetBorrowedBooks: () =>
    useMutation<BorrowedBooksRenewResponse, AxiosError, number>({
      mutationFn: renewApi.getBorrowedBooks,
    }),

  useRenewBook: () => {
    const qc = useQueryClient();
    return useMutation<RenewBookResult, AxiosError, RenewBookPayload>({
      mutationFn: renewApi.renewBook,
      onSuccess: () => qc.invalidateQueries({ queryKey: ['renew-list'] }),
    });
  },

  useRenewList: () =>
    useQuery<RenewListResponse>({
      queryKey: ['renew-list'],
      queryFn: renewApi.getRenewList,
      staleTime: 30_000,
    }),
};
