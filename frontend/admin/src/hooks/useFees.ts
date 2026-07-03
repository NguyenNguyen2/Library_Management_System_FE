import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feesApi, FineType, PaymentMethod } from '../api/feesApi';

const KEYS = {
  fines:   'adminFines',
  history: 'adminFeeHistory',
  revenue: 'adminFeeRevenue',
};

export const feesHooks = {
  // Danh sách phí chưa thu
  useFines: (params?: { search?: string; type?: FineType; page?: number }) =>
    useQuery({
      queryKey: [KEYS.fines, params],
      queryFn:  () => feesApi.getFines(params),
    }),

  // Lịch sử thu phí
  useHistory: (params?: { search?: string; date_from?: string; date_to?: string; method?: string; page?: number }) =>
    useQuery({
      queryKey: [KEYS.history, params],
      queryFn:  () => feesApi.getHistory(params),
    }),

  // Báo cáo doanh thu
  useRevenue: (year: number, groupBy: 'month' | 'day' = 'month') =>
    useQuery({
      queryKey: [KEYS.revenue, year, groupBy],
      queryFn:  () => feesApi.getRevenue(year, groupBy),
      staleTime: 5 * 60 * 1000,
    }),

  // Ghi nhận thanh toán
  useRecordPayment: () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ fineId, method }: { fineId: number; method: PaymentMethod }) =>
        feesApi.recordPayment(fineId, method),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [KEYS.fines] });
        qc.invalidateQueries({ queryKey: [KEYS.history] });
        qc.invalidateQueries({ queryKey: [KEYS.revenue] });
      },
    });
  },

  // Tạo phí hỏng/mất
  useCreateDamageFine: () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: feesApi.createDamageFine,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [KEYS.fines] });
      },
    });
  },
};
