import axiosInstance from './axiosInstance';

export type EventType = 'borrow' | 'return' | 'renew';
export type TxStatus = 'active' | 'overdue' | 'returned_on_time' | 'overdue_returned';

export interface TransactionLogItem {
  borrow_id: number;
  copy_id: number;
  ma_gd: string;
  event_type: EventType;
  event_date: string;
  reader_name: string;
  book_title: string;
  librarian_name: string;
  tx_status: TxStatus;
  fine_amount: number;
  fine_status: string | null;
}

export interface TransactionLogMeta {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

export interface TransactionLogParams {
  q?: string;
  type?: string;
  date?: string;
  page?: number;
  per_page?: number;
}

export interface TransactionLogResponse {
  objects: TransactionLogItem[];
  meta: TransactionLogMeta;
}

export const transactionLogApi = {
  getList: async (params: TransactionLogParams): Promise<TransactionLogResponse> => {
    const res = await axiosInstance.get('/private/v1/transactions/log', { params });
    return res.data?.results;
  },
};
