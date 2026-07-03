import axiosInstance from './axiosInstance';

export type ImportSuggestion = {
  book_id?: number;
  keyword: string;
  search_count: number;
  source: 'search_log' | 'wishlist';
  suggestion: string;
};

export type LowBorrowBook = {
  book_name: string;
  category: string;
  last_borrow_date: string | null;
  suggestion: 'Thanh lý' | 'Chuyển kho';
};

export type SeasonalDemand = {
  month: number;
  category: string;
  borrow_count: number;
};

export const aiDemandApi = {
  getImportSuggestions: (): Promise<ImportSuggestion[]> =>
    axiosInstance.get('/private/v1/ai/import-suggestions').then((r) => r.data),

  getLowBorrowBooks: (): Promise<LowBorrowBook[]> =>
    axiosInstance.get('/private/v1/ai/low-borrow-books').then((r) => r.data),

  getSeasonalDemand: (year: number): Promise<SeasonalDemand[]> =>
    axiosInstance.get('/private/v1/ai/seasonal-demand', { params: { year } }).then((r) => r.data),
};
