import axiosInstance from './axiosInstance';

export interface HistoryUser {
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  card_number: string | null;
}

export interface CurrentBorrow {
  borrow_id: number;
  borrow_date: string;
  due_date: string;
  status: 'active' | 'overdue';
  copy_id: number;
  barcode: string;
  book_id: number;
  title: string;
  cover_image: string | null;
  renew_count: number;
  overdue_days: number;
  is_overdue: boolean;
}

export interface BorrowHistoryItem {
  borrow_id: number;
  borrow_date: string;
  due_date: string;
  return_date: string;
  copy_id: number;
  barcode: string;
  book_id: number;
  title: string;
  condition_return: string | null;
  renew_count: number;
  overdue_days: number;
  fine_amount: number;
  fine_status: 'paid' | 'unpaid' | null;
}

export interface FineHistoryItem {
  fine_id: number;
  borrow_id: number;
  copy_id: number;
  barcode: string | null;
  title: string | null;
  amount: number;
  reason: string | null;
  status: 'paid' | 'unpaid';
  created_at: string;
}

export interface ReservationHistoryItem {
  reservation_id: number;
  book_id: number;
  title: string;
  cover_image: string | null;
  queue_position: number;
  status: 'waiting' | 'ready' | 'converted' | 'expired' | 'cancelled';
  notified_at: string | null;
  expired_at: string | null;
  created_at: string;
}

export interface UserHistoryResponse {
  user: HistoryUser;
  current_borrows: CurrentBorrow[];
  history: BorrowHistoryItem[];
  fines: FineHistoryItem[];
  reservations: ReservationHistoryItem[];
}

export const historyApi = {
  getUserHistory: async (userId: number): Promise<UserHistoryResponse> => {
    const res = await axiosInstance.get(`/private/v1/users/${userId}/history`);
    return res.data?.results;
  },
};
