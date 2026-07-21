// ─── Legacy types (used by getDashboardData / DashboardPage chart) ────────────

export interface IDashboardLegacyStats {
  totalBooks: number;
  activeUsers: number;
  overdueCount: number;
  totalBorrowMonth: number;
}

export interface ITrendPoint {
  day: string;
  borrow: number;
  return: number;
}

export interface IInventoryItem {
  name: string;
  value: number;
  color: string;
}

export interface ITopBook {
  rank: number;
  title: string;
  author: string;
  borrows: number;
}

export interface IOverdueItem {
  id: string;
  reader: string;
  book: string;
  days: number;
  fee: number;
}

export interface IDashboardData {
  stats: IDashboardLegacyStats;
  trendData: ITrendPoint[];
  inventoryData: IInventoryItem[];
  topBooks: ITopBook[];
  overdueList: IOverdueItem[];
}

// ─── New dedicated analytics types ───────────────────────────────────────────

export interface IOverdueSeverity {
  light: number;
  medium: number;
  heavy: number;
}

export interface IReservationFlow {
  pending: number;
  ready_for_pickup: number;
  completed: number;
  expired: number;
  cancelled: number;
}

export interface IDashboardSummary {
  total_books: number;
  total_copies: number;
  active_borrows: number;
  overdue_users: number;
  total_fines_unpaid: number;
  total_reservations: number;
  transactions_today: number;
  fine_per_day: number;
  overdue_severity: IOverdueSeverity;
  reservation_flow: IReservationFlow;
}

export interface IBorrowSeries {
  date: string;
  borrow: number;
  return: number;
}

export interface IMonthlyBorrow {
  month: string;
  borrow: number;
  return: number;
}

export interface IBorrowStats {
  range: string;
  days: number;
  series: IBorrowSeries[];
  monthly: IMonthlyBorrow[];
}

export interface ITopBookItem {
  rank: number;
  book_id: number;
  title: string;
  author: string;
  cover_image: string | null;
  borrow_count?: number;
  reservation_count?: number;
}

export interface ITopBooksData {
  top_borrowed: ITopBookItem[];
  top_reserved: ITopBookItem[];
}

export interface IOverdueRow {
  borrow_id: number;
  due_date: string;
  user_id: number;
  full_name: string;
  email: string;
  card_number: string | null;
  barcode: string;
  book_id: number;
  title: string;
  overdue_days: number;
  severity: 'light' | 'medium' | 'heavy';
  fine_amount: number;
  fine_status: string;
}

export interface IOverdueData {
  summary: { total: number; light: number; medium: number; heavy: number };
  rows: IOverdueRow[];
}

// ─── Recent activities ────────────────────────────────────────────────────────

export interface IRecentActivity {
  id: string;
  userName: string;
  courseName: string;
  date: string;
}

export interface IRecentActivitiesPage {
  rows: IRecentActivity[];
  total: number;
  page: number;
  limit: number;
}
