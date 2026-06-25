import axiosInstance from './axiosInstance';

export interface ReaderInfo {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  library_card: {
    card_id: number;
    card_number: string;
    status: number;
    expiry_date: string;
  } | null;
  borrowing_count: number;
  borrow_limit: number;
  unpaid_fines: number;
  can_borrow: boolean;
  warnings: string[];
}

export interface BookCopyInfo {
  copy_id: number;
  barcode: string;
  status: string;
  condition: string;
  shelf_location: string;
  book: {
    book_id: number;
    title: string;
    cover_image: string | null;
  };
}

export interface CheckoutPayload {
  user_id: number;
  copy_ids: number[];
}

export interface CheckoutResult {
  borrow_id: number;
  borrow_date: string;
  due_date: string;
  status: string;
  reader: { user_id: number; full_name: string; card_number: string };
  librarian_name: string;
  books: Array<{ copy_id: number; barcode: string; title: string }>;
}

export interface AvailableCopy {
  copy_id: number;
  barcode: string;
  condition: string;
  book_id: number;
  title: string;
  author: string;
}

export const checkoutApi = {
  findReader: async (keyword: string): Promise<ReaderInfo[]> => {
    const response = await axiosInstance.get('/private/v1/checkout/find-reader', {
      params: { keyword },
    });
    return response.data?.results?.objects ?? [];
  },

  searchAvailableCopies: async (q: string): Promise<AvailableCopy[]> => {
    if (!q || q.trim().length === 0) return [];
    const response = await axiosInstance.get('/private/v1/checkout/available-copies', {
      params: { q: q.trim() },
    });
    return response.data?.results?.objects ?? [];
  },

  validateCopy: async (barcode: string): Promise<BookCopyInfo> => {
    const response = await axiosInstance.get(`/private/v1/checkout/copy/${encodeURIComponent(barcode)}`);
    return response.data?.results?.object;
  },

  checkout: async (body: CheckoutPayload): Promise<CheckoutResult> => {
    const response = await axiosInstance.post('/private/v1/checkout', body);
    return response.data?.results?.object;
  },
};
