import axiosInstance from '@/lib/axios/axios-client';

export interface IBookSearchResult {
  book_id: number;
  title: string;
  author: string | null;
  isbn: string | null;
  cover_image: string | null;
  available_copies: number;
}

export interface IBookSearchParams {
  q?: string;
  category_id?: number;
  author_id?: number;
  publisher_id?: number;
  language?: string;
  year_from?: number;
  year_to?: number;
  available_only?: 1;
}

export interface IBookFilterOptions {
  categories: { category_id: number; category_name: string }[];
  authors: { author_id: number; author_name: string }[];
  publishers: { publisher_id: number; name: string }[];
  languages: string[];
}

export const bookApi = {
  search: async (params: IBookSearchParams): Promise<IBookSearchResult[]> => {
    const response = await axiosInstance.get('/v1/books/search', { params });
    return response.data;
  },

  filterOptions: async (): Promise<IBookFilterOptions> => {
    const response = await axiosInstance.get('/v1/books/filter-options');
    return response.data;
  },
};
