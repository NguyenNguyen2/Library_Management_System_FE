import axiosInstance from '@/lib/axios/axios-client';

export interface IFineStatus {
  value: 'paid' | 'unpaid';
  label: string;
}

export type IFineType = 'late' | 'damage' | 'lost' | 'other';

export interface IFine {
  fine_id: number;
  borrow_id: number;
  book_id: number;
  title: string;
  cover_image: string | null;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  /** Ngày ghi nhận thanh toán — KHÔNG phải ngày trả sách. */
  payment_date: string | null;
  /**
   * Số ngày đã dùng để hình thành `amount` hiện tại (chỉ có với type='late').
   * - status=paid: số ngày đã CHỐT lúc thanh toán (không đổi theo thời gian).
   * - status=unpaid: tính RUNTIME từ due_date/return_date, cùng công thức trang "Đang mượn"
   *   (BorrowingController) — luôn khớp với số ngày quá hạn hiển thị ở đó.
   */
  charged_days_late: number | null;
  /**
   * Với type='late' + status=unpaid: số tiền đang nợ THỰC TẾ = charged_days_late × fine_per_day
   * (tính runtime, KHÔNG phải giá trị cũ lưu trong DB). Các trường hợp khác = số tiền đã lưu.
   */
  amount: number;
  reason: string;
  type: IFineType;
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
