import axiosInstance from './axiosInstance';
import {
  TransactionReportData,
  TransactionReportParams,
  TopBook,
  TopBooksParams,
  TopAuthor,
  TopAuthorsParams,
  TopCategory,
  TopCategoriesParams,
  TopReader,
  TopReadersParams,
  MonthlyRegistration,
  ReaderRegistrationParams,
  OverdueBook,
  OverdueBookParams,
  OverdueSummaryItem,
  FineRevenueItem,
  FineRevenueParams,
  FineReasonItem,
} from '../types/ReportType';

export const reportApi = {
  // Phase 1 — Báo cáo giao dịch mượn/trả
  getTransactionReport: async (params: TransactionReportParams = {}): Promise<TransactionReportData> => {
    const res = await axiosInstance.get('/private/v1/reports/transactions', { params });
    return res?.data?.results?.object;
  },

  // Phase 2 — Top sách được mượn nhiều nhất
  getTopBooks: async (params: TopBooksParams = {}): Promise<TopBook[]> => {
    const res = await axiosInstance.get('/private/v1/reports/top-books', { params });
    return res?.data?.results?.objects ?? [];
  },

  // Phase 2 (mở rộng) — Top tác giả được mượn nhiều nhất
  getTopAuthors: async (params: TopAuthorsParams = {}): Promise<TopAuthor[]> => {
    const res = await axiosInstance.get('/private/v1/reports/top-authors', { params });
    return res?.data?.results?.objects ?? [];
  },

  // Phase 2 (mở rộng) — Top thể loại được mượn nhiều nhất
  getTopCategories: async (params: TopCategoriesParams = {}): Promise<TopCategory[]> => {
    const res = await axiosInstance.get('/private/v1/reports/top-categories', { params });
    return res?.data?.results?.objects ?? [];
  },

  // Phase 3A — Top độc giả mượn nhiều nhất
  getTopReaders: async (params: TopReadersParams = {}): Promise<TopReader[]> => {
    const res = await axiosInstance.get('/private/v1/reports/top-readers', { params });
    return res?.data?.results?.objects ?? [];
  },

  // Phase 3B — Xu hướng đăng ký độc giả mới theo tháng
  getReaderRegistrations: async (params: ReaderRegistrationParams = {}): Promise<MonthlyRegistration[]> => {
    const res = await axiosInstance.get('/private/v1/reports/reader-registrations', { params });
    return res?.data?.results?.objects ?? [];
  },

  // Phase 4 — Danh sách sách quá hạn
  getOverdueBooks: async (params: OverdueBookParams = {}): Promise<OverdueBook[]> => {
    const res = await axiosInstance.get('/private/v1/reports/overdue-books', { params });
    return res?.data?.results?.objects ?? [];
  },

  // Phase 4 — Thống kê quá hạn theo nhóm ngày (real-time, không cần params)
  getOverdueSummary: async (): Promise<OverdueSummaryItem[]> => {
    const res = await axiosInstance.get('/private/v1/reports/overdue-summary');
    return res?.data?.results?.objects ?? [];
  },

  // Phase 4 — Doanh thu tiền phạt theo tháng (lọc theo payment_date)
  getFineRevenue: async (params: FineRevenueParams = {}): Promise<FineRevenueItem[]> => {
    const res = await axiosInstance.get('/private/v1/reports/fine-revenue', { params });
    return res?.data?.results?.objects ?? [];
  },

  // Phase 4 — Thống kê nguyên nhân tiền phạt (all-time, không có params)
  getFineReasons: async (): Promise<FineReasonItem[]> => {
    const res = await axiosInstance.get('/private/v1/reports/fine-reasons');
    return res?.data?.results?.objects ?? [];
  },
};
