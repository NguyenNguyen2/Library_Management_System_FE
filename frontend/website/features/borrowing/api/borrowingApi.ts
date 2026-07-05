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
  renewal_pending: boolean;
}

export interface IBorrowingResponse {
  data: IBorrowedBook[];
}

export interface IBorrowRenewalRequestResponse {
  message: string;
  request_id: number;
  pending: boolean;
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

  submitRenewalRequest: async (borrowId: number): Promise<IBorrowRenewalRequestResponse> => {
    const response = await axiosInstance.post(`/v1/me/borrowing/${borrowId}/renew`);
    return response.data;
  },

  getHistory: async (): Promise<IBorrowHistoryResponse> => {
    const response = await axiosInstance.get('/v1/me/borrowing/history');
    return response.data;
  },
};
