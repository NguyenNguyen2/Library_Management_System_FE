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

export const libraryCardApi = {
  getCard: async (userId: string): Promise<ILibraryCard> => {
    const response = await axiosInstance.get(`/v1/library-card/${userId}`);
    return response.data;
  },
};
