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

export const borrowingApi = {
  getCurrentBorrowing: async (): Promise<IBorrowingResponse> => {
    const response = await axiosInstance.get('/v1/me/borrowing');
    return response.data;
  },
};
