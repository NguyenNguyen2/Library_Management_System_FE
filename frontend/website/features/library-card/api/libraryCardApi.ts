import axiosInstance from '@/lib/axios/axios-client';

export interface ILibraryCard {
  card_id: number;
  card_number: string;
  issue_date: string;
  expiry_date: string;
  borrow_limit: number;
  max_borrow_days: number;
  card_status: string;
}

export interface ICardRenewalRequest {
  request_id: number;
  card_id: number;
  user_id: number;
  requested_expiry_date: string;
  status: 'pending' | 'approved' | 'rejected';
  review_note: string | null;
  requested_at: string;
}

export interface ISubmitCardRenewalResponse {
  message: string;
  request_id: number;
}

export const libraryCardApi = {
  getCard: async (userId: string): Promise<ILibraryCard> => {
    const response = await axiosInstance.get(`/v1/library-card/${userId}`);
    return response.data;
  },

  submitRenewalRequest: async (): Promise<ISubmitCardRenewalResponse> => {
    const response = await axiosInstance.post('/v1/me/library-card/renewal-request');
    return response.data;
  },

  getMyRenewalRequests: async (): Promise<{ data: ICardRenewalRequest[] }> => {
    const response = await axiosInstance.get('/v1/me/library-card/renewal-requests');
    return response.data;
  },
};
