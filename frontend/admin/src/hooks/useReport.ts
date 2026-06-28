import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import { QueryKey } from '../constants/queryKey';
import {
  TransactionReportParams,
  TopBooksParams,
  TopReadersParams,
  ReaderRegistrationParams,
} from '../types/ReportType';

export const reportHooks = {
  // Phase 1 — Báo cáo giao dịch mượn/trả
  useTransactionReport: (params: TransactionReportParams) =>
    useQuery({
      queryKey: [QueryKey.reports.transactions, params],
      queryFn:  () => reportApi.getTransactionReport(params),
      staleTime: 60_000,
    }),

  // Phase 2 — Top sách được mượn nhiều nhất
  useTopBooks: (params: TopBooksParams) =>
    useQuery({
      queryKey: [QueryKey.reports.topBooks, params],
      queryFn:  () => reportApi.getTopBooks(params),
      staleTime: 60_000,
    }),

  // Phase 3A — Top độc giả mượn nhiều nhất
  // queryKey chứa params → đổi limit hoặc ngày = cache entry mới = fetch lại
  // staleTime 60s: báo cáo không cần realtime, 60s đủ cho user tương tác
  useTopReaders: (params: TopReadersParams) =>
    useQuery({
      queryKey: [QueryKey.reports.topReaders, params],
      queryFn:  () => reportApi.getTopReaders(params),
      staleTime: 60_000,
    }),

  // Phase 3B — Xu hướng đăng ký độc giả mới theo tháng
  // queryKey chứa params → đổi date range = fetch data mới cho range đó
  useReaderRegistrations: (params: ReaderRegistrationParams) =>
    useQuery({
      queryKey: [QueryKey.reports.readerRegistrations, params],
      queryFn:  () => reportApi.getReaderRegistrations(params),
      staleTime: 60_000,
    }),
};
