import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  checkoutApi,
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
