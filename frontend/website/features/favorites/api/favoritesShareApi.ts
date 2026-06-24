import axiosInstance from '@/lib/axios/axios-client';

export interface IFavoritesShareResponse {
  success: boolean;
  token: string;
}

export interface ISharedFavoritesBook {
  book_id: number;
  title: string;
  cover_image: string | null;
  author_name: string | null;
  avg_rating: number | null;
  available_copies: number;
}

export interface ISharedFavoritesData {
  owner_name: string;
  total: number;
  books: ISharedFavoritesBook[];
}

export interface ISharedFavoritesResponse {
  data: ISharedFavoritesData;
}

export const favoritesShareApi = {
  share: async (): Promise<IFavoritesShareResponse> => {
    const response = await axiosInstance.post('/v1/me/favorites/share');
    return response.data;
  },

  getPublic: async (token: string): Promise<ISharedFavoritesResponse> => {
    const response = await axiosInstance.get(`/v1/public/shared/favorites/${token}`);
    return response.data;
  },
};
