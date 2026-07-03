import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  returnApi,
  ReturnReaderInfo,
  BorrowedBook,
  ValidatedReturnCopy,
  ConfirmReturnPayload,
  ConfirmReturnResult,
} from '../api/returnApi';

export const returnHooks = {
  useSearchReader: () =>
    useMutation<ReturnReaderInfo[], AxiosError, string>({
      mutationFn: returnApi.searchReader,
    }),

  useGetBorrowedBooks: () =>
    useMutation<BorrowedBook[], AxiosError, number>({
      mutationFn: returnApi.getBorrowedBooks,
    }),

  useValidateCopy: () =>
    useMutation<ValidatedReturnCopy, AxiosError, { barcode: string; userId: number }>({
      mutationFn: returnApi.validateCopy,
    }),

  useConfirmReturn: () => {
    const qc = useQueryClient();
    return useMutation<ConfirmReturnResult, AxiosError, ConfirmReturnPayload>({
      mutationFn: returnApi.confirmReturn,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['reportTodayReport'] });
        qc.invalidateQueries({ queryKey: ['dashboard-summary'] });
        qc.invalidateQueries({ queryKey: ['dashboard-overdue'] });
      },
    });
  },
};
