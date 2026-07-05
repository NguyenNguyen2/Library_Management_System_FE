import axiosInstance from './axiosInstance';

export type FineType = 'late' | 'damage' | 'lost';
export type FineStatus = 'unpaid' | 'partial' | 'paid';
export type PaymentMethod = 'cash' | 'transfer' | 'momo';

export type Fine = {
  fine_id: number;
  borrow_id: number | null;
  copy_id: number | null;
  copy_barcode: string | null;
  user_id: number;
  reader_name: string;
  reader_email: string;
  book_title: string;
  amount: number;
  reason: string;
  type: FineType;
  status: FineStatus;
  due_date: string | null;
  created_at: string | null;
};

export type HistoryFine = Fine & {
  paid_at: string | null;
  payment_method: PaymentMethod | null;
  paid_amount: number | null;
};

export type RevenueSeries = { period: string | number; total: number; count: number };
export type RevenueBreakdown = { type: FineType; total: number; count: number };
export type RevenueData = {
  year: number;
  group_by: 'month' | 'day';
  total_revenue: number;
  total_count: number;
  series: RevenueSeries[];
  breakdown: RevenueBreakdown[];
};

export type PaginatedMeta = {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
};

export const feesApi = {
  // Feature 1 & 2: Danh sách phí chưa thu
  getFines: (params?: { search?: string; type?: FineType; page?: number; per_page?: number }) =>
    axiosInstance.get<{ data: Fine[]; meta: PaginatedMeta }>('/private/v1/fees', { params }).then(r => r.data),

  // Feature 2: Tạo phí bồi thường
  createDamageFine: (data: { user_id: number; copy_id: number; borrow_id?: number; damage_level: 'minor' | 'heavy' | 'lost' }) =>
    axiosInstance.post('/private/v1/fees/damage', data).then(r => r.data),

  // Feature 3: Ghi nhận thanh toán
  recordPayment: (fineId: number, method: PaymentMethod) =>
    axiosInstance.post(`/private/v1/fees/${fineId}/pay`, { method }).then(r => r.data),

  // Feature 4: Lịch sử thu phí
  getHistory: (params?: { search?: string; date_from?: string; date_to?: string; method?: string; page?: number }) =>
    axiosInstance.get<{ data: HistoryFine[]; meta: PaginatedMeta }>('/private/v1/fees/history', { params }).then(r => r.data),

  // Feature 5: Báo cáo doanh thu
  getRevenue: (year: number, group_by: 'month' | 'day' = 'month') =>
    axiosInstance.get<RevenueData>('/private/v1/fees/revenue', { params: { year, group_by } }).then(r => r.data),
};
