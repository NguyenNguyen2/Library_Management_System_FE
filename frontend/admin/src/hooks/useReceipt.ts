import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { receiptApi } from '../api/receiptApi';

export const receiptHooks = {
  useCheckoutReceipt: () =>
    useMutation<void, AxiosError, number>({
      mutationFn: receiptApi.getCheckoutReceipt,
    }),

  useReturnReceipt: () =>
    useMutation<void, AxiosError, number>({
      mutationFn: receiptApi.getReturnReceipt,
    }),
};
