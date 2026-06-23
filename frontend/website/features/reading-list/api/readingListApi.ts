import axiosInstance from '@/lib/axios/axios-client';

export type IReadingListStatus = 'favorite' | 'want_to_read' | 'reading' | 'finished';

export interface IReadingListStatusObj {
  value: IReadingListStatus;
  label: string;
}

export interface IReadingListItem {
  wishlist_id: number;
  book_id: number;
  title: string;
  cover_image: string | null;
  author_name: string | null;
  avg_rating: number | null;
  available_copies: number;
  status: IReadingListStatusObj;
  note: string | null;
  created_at: string;
}

export interface IReadingListResponse {
  data: IReadingListItem[];
}

export interface IAddPayload {
  book_id: number;
  status: IReadingListStatus;
  note?: string;
}

export interface IUpdatePayload {
  wishlistId: number;
  status?: IReadingListStatus;
  note?: string | null;
}

export const readingListApi = {
  getReadingList: async (): Promise<IReadingListResponse> => {
    const response = await axiosInstance.get('/v1/me/wishlist');
    return response.data;
  },

  addToReadingList: async (payload: IAddPayload): Promise<{ message: string; data: IReadingListItem }> => {
    const { ...body } = payload;
    const response = await axiosInstance.post('/v1/me/wishlist', body);
    return response.data;
  },

  updateReadingList: async ({ wishlistId, ...body }: IUpdatePayload): Promise<{ message: string; data: IReadingListItem }> => {
    const response = await axiosInstance.patch(`/v1/me/wishlist/${wishlistId}`, body);
    return response.data;
  },

  removeReadingList: async (wishlistId: number): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/v1/me/wishlist/${wishlistId}`);
    return response.data;
  },
};
