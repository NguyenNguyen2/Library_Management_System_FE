export type ReportGroupBy = 'day' | 'week' | 'month';

export interface TransactionSummary {
  total_borrows:  number;
  total_returns:  number;
  active_borrows: number;
  overdue:        number;
}

export interface ChartPoint {
  period:  string;
  label:   string;
  borrows: number;
  returns: number;
}

export interface TransactionReportData {
  summary: TransactionSummary;
  chart:   ChartPoint[];
}

export interface TransactionReportParams {
  from_date?: string;
  to_date?:   string;
  group_by?:  ReportGroupBy;
}

// ── Phase 2 ────────────────────────────────────────────────────────────────

export interface TopBook {
  rank:           number;
  book_id:        number;
  title:          string;
  cover_image:    string | null;
  author_name:    string;
  category_names: string | null;
  borrow_count:   number;
}

export interface TopBooksParams {
  from_date?: string;
  to_date?:   string;
  limit?:     number;
}

// ── Phase 2 (mở rộng) — Top tác giả & Top thể loại ────────────────────────

export interface TopAuthor {
  rank:         number;
  author_id:    number;
  author_name:  string;
  borrow_count: number;
}

export interface TopAuthorsParams {
  from_date?: string;
  to_date?:   string;
  limit?:     number;
}

export interface TopCategory {
  rank:          number;
  category_id:   number;
  category_name: string;
  borrow_count:  number;
}

export interface TopCategoriesParams {
  from_date?: string;
  to_date?:   string;
  limit?:     number;
}

// ── Phase 3 ────────────────────────────────────────────────────────────────

// Phase 3A: Một độc giả trong bảng xếp hạng
export interface TopReader {
  rank:         number;
  user_id:      number;
  full_name:    string;
  email:        string;
  avatar_url:   string | null;
  borrow_count: number;
}

// Phase 3A: Params cho endpoint top-readers
export interface TopReadersParams {
  from_date?: string;
  to_date?:   string;
  limit?:     number;
}

// Phase 3B: Một điểm dữ liệu trên timeline đăng ký theo tháng
export interface MonthlyRegistration {
  period: string; // 'YYYY-MM'  — dùng làm key nội bộ
  label:  string; // 'T7/2025'  — hiển thị trên chart
  count:  number; // số độc giả đăng ký mới trong tháng
}

// Phase 3B: Params cho endpoint reader-registrations (không có limit, không có group_by)
export interface ReaderRegistrationParams {
  from_date?: string;
  to_date?:   string;
}

// ── Phase 4 ────────────────────────────────────────────────────────────────

// Mức độ nghiêm trọng quá hạn — tính từ overdue_days phía backend
export type OverdueStatus = 'low' | 'medium' | 'high';

// Phase 4: Một bản sao sách đang quá hạn (1 hàng trong bảng)
export interface OverdueBook {
  borrow_id:    number;
  reader_name:  string;
  reader_email: string;
  book_title:   string;
  due_date:     string;       // 'YYYY-MM-DD'
  overdue_days: number;       // DATEDIFF(CURDATE(), due_date)
  status:       OverdueStatus; // 'low' | 'medium' | 'high'
  fine_amount:  number;       // tổng tiền phạt (0 nếu chưa có)
}

// Phase 4: Params cho endpoint overdue-books
export interface OverdueBookParams {
  from_date?: string;
  to_date?:   string;
  status?:    OverdueStatus;
}

// Phase 4: Một nhóm ngày trong báo cáo tổng hợp quá hạn
export interface OverdueSummaryItem {
  range_key: string; // '1-7' | '8-30' | '30+'
  label:     string; // 'Quá hạn 1–7 ngày' | ...
  count:     number; // số phiếu mượn trong nhóm này
}

// ── Phase 4 — Fine Revenue ─────────────────────────────────────────────────

// Một tháng trong biểu đồ doanh thu tiền phạt
export interface FineRevenueItem {
  period:     string; // 'YYYY-MM' — dùng làm key nội bộ
  label:      string; // 'T1/2026' — hiển thị trên chart
  revenue:    number; // tổng tiền thực tế đã thu trong tháng (payments.amount)
  fine_count: number; // số phiếu phạt đã được thanh toán trong tháng
}

// Params cho endpoint fine-revenue (chỉ date range, không có group_by)
export interface FineRevenueParams {
  from_date?: string;
  to_date?:   string;
}

// Một nhóm nguyên nhân trong báo cáo thống kê lý do phạt
export interface FineReasonItem {
  category:     string; // 'Trả sách trễ hạn' | 'Mất sách' | 'Hư hỏng sách' | 'Khác'
  fine_count:   number; // số lần phát sinh trong nhóm này
  total_amount: number; // tổng tiền phạt trong nhóm (bao gồm cả chưa thu)
}

// ── Báo cáo hoạt động hôm nay ─────────────────────────────────────────────

export interface TodayBorrow {
  borrow_id:    number;
  borrow_date:  string;
  due_date:     string;
  reader_name:  string;
  reader_email: string;
  card_number:  string | null;
  status:       string;
  books:        string | null;
}

export interface TodayReturn {
  borrow_id:    number;
  book_title:   string;
  return_date:  string;
  reader_name:  string;
  reader_email: string;
  fine_amount:  number;
}

export interface TodayReservation {
  reservation_id: number;
  created_at:     string;
  reader_name:    string;
  reader_email:   string;
  book_title:     string;
  queue_position: number;
  status:         string;
}

export interface TodaySummary {
  total_borrows:      number;
  total_returns:      number;
  total_reservations: number;
}

export interface TodayReportData {
  summary: TodaySummary;
  details: {
    borrows:      TodayBorrow[];
    returns:      TodayReturn[];
    reservations: TodayReservation[];
  };
}
