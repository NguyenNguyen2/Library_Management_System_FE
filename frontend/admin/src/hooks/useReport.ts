import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/reportApi';
import { QueryKey } from '../constants/queryKey';
import {
  TransactionReportParams,
  TopBooksParams,
  TopAuthorsParams,
  TopCategoriesParams,
  TopReadersParams,
  ReaderRegistrationParams,
  OverdueBookParams,
  FineRevenueParams,
  TodayReportData,
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

  // Phase 2 (mở rộng) — Top tác giả được mượn nhiều nhất
  // queryKey chứa params → đổi limit/ngày = cache entry mới = fetch lại
  useTopAuthors: (params: TopAuthorsParams) =>
    useQuery({
      queryKey: [QueryKey.reports.topAuthors, params],
      queryFn:  () => reportApi.getTopAuthors(params),
      staleTime: 60_000,
    }),

  // Phase 2 (mở rộng) — Top thể loại được mượn nhiều nhất
  // queryKey chứa params → đổi limit/ngày = cache entry mới = fetch lại
  useTopCategories: (params: TopCategoriesParams) =>
    useQuery({
      queryKey: [QueryKey.reports.topCategories, params],
      queryFn:  () => reportApi.getTopCategories(params),
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

  // Phase 4 — Danh sách bản sao sách đang quá hạn
  // queryKey chứa params (date range + status) → đổi filter = invalidate cache = fetch lại
  useOverdueBooks: (params: OverdueBookParams) =>
    useQuery({
      queryKey: [QueryKey.reports.overdueBooks, params],
      queryFn:  () => reportApi.getOverdueBooks(params),
      staleTime: 60_000,
    }),

  // Phase 4 — Thống kê quá hạn theo nhóm ngày (real-time snapshot)
  // queryKey không chứa params vì endpoint không có filter — cache theo key cố định
  useOverdueSummary: () =>
    useQuery({
      queryKey: [QueryKey.reports.overdueSummary],
      queryFn:  () => reportApi.getOverdueSummary(),
      staleTime: 60_000,
    }),

  // Phase 4 — Doanh thu tiền phạt theo tháng
  // queryKey chứa params → đổi date range = cache miss = fetch lại với range mới
  useFineRevenue: (params: FineRevenueParams) =>
    useQuery({
      queryKey: [QueryKey.reports.fineRevenue, params],
      queryFn:  () => reportApi.getFineRevenue(params),
      staleTime: 60_000,
    }),

  // Phase 4 — Thống kê nguyên nhân tiền phạt (all-time, không phụ thuộc date)
  // queryKey cố định (không có params) → 60s cache dùng chung toàn bộ session
  useFineReasons: () =>
    useQuery({
      queryKey: [QueryKey.reports.fineReasons],
      queryFn:  () => reportApi.getFineReasons(),
      staleTime: 60_000,
    }),

  // Báo cáo hôm nay (mượn, trả, đặt trước)
  useTodayReport: () =>
    useQuery<TodayReportData>({
      queryKey: [QueryKey.reports.todayReport],
      queryFn:  () => reportApi.getTodayReport(),
      staleTime: 10_000,
    }),
};
