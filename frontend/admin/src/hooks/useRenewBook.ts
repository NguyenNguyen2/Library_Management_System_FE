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
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['renew-list'] });
        qc.invalidateQueries({ queryKey: ['reportTodayReport'] });
        qc.invalidateQueries({ queryKey: ['dashboard-summary'] });
      },
    });
  },

  // Poll để danh sách tự cập nhật khi Reader hủy yêu cầu — không cần F5.
  useRenewList: () =>
    useQuery<RenewListResponse>({
      queryKey: ['renew-list'],
      queryFn: renewApi.getRenewList,
      staleTime: 5_000,
      refetchInterval: 5_000,
    }),

  useRejectBook: () => {
    const qc = useQueryClient();
    return useMutation<{ message: string }, AxiosError, { requestId: number; reviewNote?: string }>({
      mutationFn: ({ requestId, reviewNote }) => renewApi.rejectBook(requestId, reviewNote),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['renew-list'] }),
    });
  },
};
