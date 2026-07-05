import axiosInstance from './axiosInstance';

export interface ReturnReaderInfo {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  library_card: { card_number: string } | null;
  active_borrows: number;
  has_overdue: boolean;
}

export interface BorrowedBook {
  borrow_id: number;
  copy_id: number;
  barcode: string;
  title: string;
  borrow_date: string;
  due_date: string;
  overdue_days: number;
  penalty_fee: number;
  renew_count: number;
  can_renew: boolean;
}

export interface ValidatedReturnCopy {
  copy_id: number;
  barcode: string;
  title: string;
  borrow_id: number;
  due_date: string;
  overdue_days: number;
  penalty_fee: number;
}

export interface ConfirmReturnPayload {
  user_id: number;
  copy_ids: number[];
}

export interface ConfirmReturnResult {
  return_date: string;
  returned_books_count: number;
  total_penalty: number;
  closed_transactions: number[];
}

export const returnApi = {
  searchReader: async (keyword: string): Promise<ReturnReaderInfo[]> => {
    const res = await axiosInstance.get('/private/v1/return/search-reader', { params: { keyword } });
    return res.data?.results?.objects ?? [];
  },

  getBorrowedBooks: async (userId: number): Promise<BorrowedBook[]> => {
    const res = await axiosInstance.get(`/private/v1/return/borrowed-books/${userId}`);
    return res.data?.results?.objects ?? [];
  },

  validateCopy: async ({
    barcode,
    userId,
  }: {
    barcode: string;
    userId: number;
  }): Promise<ValidatedReturnCopy> => {
    const res = await axiosInstance.get(`/private/v1/return/validate/${barcode}`, {
      params: { user_id: userId },
    });
    return res.data?.results?.object;
  },

  confirmReturn: async (payload: ConfirmReturnPayload): Promise<ConfirmReturnResult> => {
    const res = await axiosInstance.post('/private/v1/return/confirm', payload);
    return res.data?.results?.object;
  },
};
