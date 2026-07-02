import axiosInstance from './axiosInstance';

export interface CardRenewalRequestItem {
  request_id: number;
  card_id: number;
  user_id: number;
  full_name: string;
  email: string;
  card_number: string;
  current_expiry_date: string;
  requested_expiry_date: string;
  status: 'pending' | 'approved' | 'rejected';
  review_note: string | null;
  requested_at: string;
  reviewed_by_name: string | null;
}

export const libraryCardRenewalApi = {
  listRequests: async (status = 'pending'): Promise<CardRenewalRequestItem[]> => {
    const res = await axiosInstance.get('/private/v1/library-card-renewal', {
      params: { status },
    });
    return res.data?.data ?? [];
  },

  approve: async (id: number, reviewNote?: string): Promise<{ message: string }> => {
    const res = await axiosInstance.post(`/private/v1/library-card-renewal/${id}/approve`, {
      review_note: reviewNote,
    });
    return res.data;
  },

  reject: async (id: number, reviewNote?: string): Promise<{ message: string }> => {
    const res = await axiosInstance.post(`/private/v1/library-card-renewal/${id}/reject`, {
      review_note: reviewNote,
    });
    return res.data;
  },
};
