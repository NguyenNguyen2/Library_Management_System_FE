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
