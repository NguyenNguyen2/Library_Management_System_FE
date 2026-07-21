import axiosInstance from './axiosInstance';

export interface BookSearchResult {
  book_id: number;
  title: string;
  cover_image: string | null;
  author_name: string;
  available_copies: number;
  total_copies: number;
  queue_count: number;
}

export interface ReservationRecord {
  reservation_id: number;
  book_id: number;
  user_id: number;
  full_name: string;
  card_number: string | null;
  title: string;
  cover_image: string | null;
  status: 'pending' | 'ready_for_pickup' | 'completed' | 'expired' | 'cancelled';
  pickup_type: 'counter' | 'online';
  copy_id: number | null;
  shelf_location: string | null;
  queue_position: number | null;
  actual_queue_position: number;
  notified_at: string | null;
  ready_at: string | null;
  pickup_deadline: string | null;
  expired_at: string | null;
  created_at: string;
}

export interface ReservationListResponse {
  objects: ReservationRecord[];
  total: number;
  per_page: number;
  page: number;
}

export interface CreateReservationPayload {
  user_id: number;
  book_id: number;
}

export interface ReaderSearchResult {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  library_card: {
    card_id: number;
    card_number: string;
    status: number;
    expiry_date: string;
    is_expired: boolean;
  } | null;
}

export interface CreateReservationResult {
  reservation_id: number;
  book_id: number;
  title: string;
  pickup_type: 'counter' | 'online';
  queue_position: number | null;
  status: string;
  created_at: string;
}

export interface ConfirmReservationPayload {
  reservation_id: number;
  copy_id?: number;
}

export interface ConfirmReservationResult {
  borrow_id: number;
  user_id: number;
  copy_id: number;
  book_title: string;
  borrow_date: string;
  due_date: string;
}

export interface MarkReadyResult {
  reservation_id: number;
  copy_id: number;
  book_title: string;
  ready_at: string;
  pickup_deadline: string;
}

export interface AvailableCopy {
  copy_id: number;
  barcode: string;
  condition: string;
  shelf_location: string | null;
}

export interface MarkReadyPayload {
  reservation_id: number;
  copy_id?: number;
}

export const reservationApi = {
  searchBook: async (keyword: string): Promise<BookSearchResult[]> => {
    const res = await axiosInstance.get('/private/v1/reservation/search-book', {
      params: { keyword },
    });
    return res.data?.results?.objects ?? [];
  },

  listReservations: async (params?: {
    user_id?: number;
    status?: string;
    keyword?: string;
    from?: string;
    to?: string;
    queue_position?: number;
    per_page?: number;
    page?: number;
  }): Promise<ReservationListResponse> => {
    const res = await axiosInstance.get('/private/v1/reservation/list', { params });
    return {
      objects: res.data?.results?.objects ?? [],
      total: res.data?.results?.total ?? 0,
      per_page: res.data?.results?.per_page ?? 20,
      page: res.data?.results?.page ?? 1,
    };
  },

  searchReader: async (keyword: string): Promise<ReaderSearchResult[]> => {
    const res = await axiosInstance.get('/private/v1/reservation/search-reader', {
      params: { keyword },
    });
    return res.data?.results?.objects ?? [];
  },

  getAvailableCopiesByBook: async (bookId: number): Promise<AvailableCopy[]> => {
    const res = await axiosInstance.get('/private/v1/reservation/available-copies', {
      params: { book_id: bookId },
    });
    return res.data?.results?.objects ?? [];
  },

  createReservation: async (
    payload: CreateReservationPayload
  ): Promise<CreateReservationResult> => {
    const res = await axiosInstance.post('/private/v1/reservation/create', payload);
    return res.data?.results?.object;
  },

  confirmReservation: async (
    payload: ConfirmReservationPayload
  ): Promise<ConfirmReservationResult> => {
    const res = await axiosInstance.post('/private/v1/reservation/confirm', payload);
    return res.data?.results?.object;
  },

  markReady: async (payload: MarkReadyPayload): Promise<MarkReadyResult> => {
    const res = await axiosInstance.post('/private/v1/reservation/mark-ready', payload);
    return res.data?.results?.object;
  },

  cancelReservation: async (reservationId: number): Promise<void> => {
    await axiosInstance.post('/private/v1/reservation/cancel', {
      reservation_id: reservationId,
    });
  },
};
