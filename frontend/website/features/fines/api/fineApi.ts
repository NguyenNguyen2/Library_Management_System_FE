import axiosInstance from '@/lib/axios/axios-client';

export interface IFineStatus {
  value: 'paid' | 'unpaid';
  label: string;
}

export interface IFine {
  fine_id: number;
  borrow_id: number;
  book_id: number;
  title: string;
  cover_image: string | null;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  days_late: number;
  amount: number;
  reason: string;
  status: IFineStatus;
  created_at: string;
}

export interface IFinesResponse {
  data: IFine[];
}

export const fineApi = {
  getFines: async (): Promise<IFinesResponse> => {
    const response = await axiosInstance.get('/v1/me/fines');
    return response.data;
  },
};
