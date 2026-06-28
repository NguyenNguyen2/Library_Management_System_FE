import axiosInstance from './axiosInstance';
import {
  TransactionReportData,
  TransactionReportParams,
  TopBook,
  TopBooksParams,
  TopReader,
  TopReadersParams,
  MonthlyRegistration,
  ReaderRegistrationParams,
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
};
