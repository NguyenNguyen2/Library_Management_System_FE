import axiosInstance from '@/lib/axios/axios-client';

export interface IBorrowedBook {
  borrow_id: number;
  copy_id: number;
  book_id: number;
  title: string;
  cover_image: string | null;
  borrow_date: string;
  due_date: string;
  days_remaining: number;
  warning_color: 'green' | 'yellow' | 'red';
}

export interface IBorrowingResponse {
  data: IBorrowedBook[];
}

export interface IRenewResult {
  borrowId: number;
  renewCount: number;
  newDueDate: string;
}

export interface IRenewResponse {
  results: {
    object: IRenewResult;
  };
  message: string;
}

export interface IBorrowReturnStatus {
  value: 'on_time' | 'late';
  label: string;
}

export interface IBorrowHistory {
  borrow_id: number;
  copy_id: number;
  book_id: number;
  title: string;
  cover_image: string | null;
  borrow_date: string;
  due_date: string;
  return_date: string;
  renew_count: number;
  days_late: number;
  return_status: IBorrowReturnStatus;
}

export interface IBorrowHistoryResponse {
  data: IBorrowHistory[];
}

export const borrowingApi = {
  getCurrentBorrowing: async (): Promise<IBorrowingResponse> => {
    const response = await axiosInstance.get('/v1/me/borrowing');
    return response.data;
  },

  renewBorrowing: async (borrowId: number): Promise<IRenewResponse> => {
    const response = await axiosInstance.post(`/v1/me/borrowing/${borrowId}/renew`);
    return response.data;
  },

  getHistory: async (): Promise<IBorrowHistoryResponse> => {
    const response = await axiosInstance.get('/v1/me/borrowing/history');
    return response.data;
  },
};
