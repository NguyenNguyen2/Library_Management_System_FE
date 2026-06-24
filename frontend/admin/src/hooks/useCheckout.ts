import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  checkoutApi,
  AvailableCopy,
  BookCopyInfo,
  CheckoutPayload,
  CheckoutResult,
  ReaderInfo,
} from '../api/checkoutApi';

export const checkoutHooks = {
  useFindReader: () => {
    return useMutation<ReaderInfo[], AxiosError, string>({
      mutationFn: checkoutApi.findReader,
    });
  },

  useSearchAvailableCopies: (q: string) =>
    useQuery<AvailableCopy[]>({
      queryKey: ['checkout-available-copies', q],
      queryFn: () => checkoutApi.searchAvailableCopies(q),
      enabled: q.trim().length >= 1,
      staleTime: 10_000,
    }),

  useValidateCopy: () => {
    return useMutation<BookCopyInfo, AxiosError, string>({
      mutationFn: checkoutApi.validateCopy,
    });
  },

  useCheckout: () => {
    return useMutation<CheckoutResult, AxiosError, CheckoutPayload>({
      mutationFn: checkoutApi.checkout,
    });
  },
};
