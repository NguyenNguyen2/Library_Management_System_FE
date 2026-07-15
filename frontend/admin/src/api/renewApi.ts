import axiosInstance from './axiosInstance';
import type { BorrowedBook } from './returnApi';

export interface BorrowedBooksRenewResponse {
  objects: BorrowedBook[];
  meta: { max_renew_times: number };
}

export interface RenewBookPayload {
  user_id: number;
  copy_ids: number[];
  extend_days: number;
}

export interface RenewedTransaction {
  borrow_id: number;
  copy_id: number;
  new_due_date: string;
}

export interface RenewBookResult {
  extended_books: number;
  extend_days: number;
  renewed_transactions: RenewedTransaction[];
}

export interface RenewListItem {
  request_id: number;
  borrow_id: number;
  user_id: number;
  full_name: string;
  card_number: string | null;
  copy_id: number;
  barcode: string;
  book_id: number;
  title: string;
  borrow_date: string;
  due_date: string;
  renew_count: number;
  max_renew_times: number;
  can_renew: boolean;
  deny_reason: string | null;
}

export interface RenewListResponse {
  objects: RenewListItem[];
  meta: { max_renew_times: number };
}

export const renewApi = {
  getBorrowedBooks: async (userId: number): Promise<BorrowedBooksRenewResponse> => {
    const res = await axiosInstance.get(`/private/v1/return/borrowed-books/${userId}`);
    return {
      objects: res.data?.results?.objects ?? [],
      meta: res.data?.results?.meta ?? { max_renew_times: 2 },
    };
  },

  getRenewList: async (): Promise<RenewListResponse> => {
    const res = await axiosInstance.get('/private/v1/checkout/renew-list');
    return {
      objects: res.data?.results?.objects ?? [],
      meta: res.data?.results?.meta ?? { max_renew_times: 2 },
    };
  },

  renewBook: async (payload: RenewBookPayload): Promise<RenewBookResult> => {
    const res = await axiosInstance.post('/private/v1/checkout/renew', payload);
    return res.data?.results?.object;
  },

  rejectBook: async (requestId: number, reviewNote?: string): Promise<{ message: string }> => {
    const res = await axiosInstance.post(`/private/v1/checkout/renew/${requestId}/reject`, {
      review_note: reviewNote,
    });
    return res.data;
  },
};
