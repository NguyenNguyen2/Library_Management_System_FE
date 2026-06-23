import axiosInstance from '@/lib/axios/axios-client';

export interface IReservation {
  reservation_id: number;
  book_id: number;
  title: string;
  cover_image: string | null;
  avg_rating: number;
  author_name: string | null;
  category_name: string | null;
  total_queue: number;
  reserved_at: string;
  status: 'waiting' | 'ready' | 'completed' | 'expired' | 'cancelled';
  queue_position: number;
  notified_at: string | null;
  expired_at: string | null;
}

export interface IReservationsResponse {
  data: IReservation[];
}

export const reservationApi = {
  getMyReservations: async (): Promise<IReservationsResponse> => {
    const response = await axiosInstance.get('/v1/me/reservations');
    return response.data;
  },

  cancelReservation: async (reservationId: number): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/v1/me/reservations/${reservationId}`);
    return response.data;
  },
};
