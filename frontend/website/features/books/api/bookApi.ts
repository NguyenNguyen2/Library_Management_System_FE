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

export interface IBookSearchPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface IBookSearchResponse {
  data: IBookSearchResult[];
  pagination: IBookSearchPagination;
}

export interface IBookFilterOptions {
  categories: { category_id: number; category_name: string }[];
  authors: { author_id: number; author_name: string }[];
  publishers: { publisher_id: number; name: string }[];
  languages: string[];
}

export interface IBookDetail {
  book_id: number;
  title: string;
  isbn: string | null;
  cover_image: string | null;
  description: string | null;
  publish_year: number | null;
  language: string | null;
  pages: number | null;
  avg_rating: number;
  total_reviews: number;
  publisher: string | null;
  available_copies: number;
  authors: string[];
  categories: string[];
}

export interface IRelatedBook {
  book_id: number;
  title: string;
  cover_image: string | null;
  available_copies: number;
}

export interface IRelatedBooks {
  same_author: IRelatedBook[];
  same_category: IRelatedBook[];
}

export interface IHomeBook {
  book_id: number;
  title: string;
  cover_image: string | null;
  available_copies: number;
}

export interface IHomeBooks {
  featured: IHomeBook[];
  new_books: IHomeBook[];
  most_borrowed: IHomeBook[];
}

export interface IReview {
  review_id: number;
  user_id: number;
  full_name: string;
  rating: number;
  content: string | null;
  created_at: string;
}

export interface IReviewPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface IReviewResponse {
  data: IReview[];
  pagination: IReviewPagination;
}

export interface IReviewPermission {
  can_review: boolean;
}

export interface ISubmitReviewParams {
  user_id: number;
  rating: number;
  content: string;
}

export const bookApi = {
  search: async (params: IBookSearchParams): Promise<IBookSearchResponse> => {
    const response = await axiosInstance.get('/v1/books/search', { params });
    return response.data;
  },

  filterOptions: async (): Promise<IBookFilterOptions> => {
    const response = await axiosInstance.get('/v1/books/filter-options');
    return response.data;
  },

  getDetail: async (bookId: number): Promise<IBookDetail> => {
    const response = await axiosInstance.get(`/v1/books/${bookId}`);
    return response.data;
  },

  getRelated: async (bookId: number): Promise<IRelatedBooks> => {
    const response = await axiosInstance.get(`/v1/books/${bookId}/related`);
    return response.data;
  },

  getHome: async (): Promise<IHomeBooks> => {
    const response = await axiosInstance.get('/v1/books/home');
    return response.data;
  },

  getReviews: async (bookId: number, page = 1): Promise<IReviewResponse> => {
    const response = await axiosInstance.get(`/v1/books/${bookId}/reviews`, { params: { page } });
    return response.data;
  },

  getReviewPermission: async (bookId: number, userId: number): Promise<IReviewPermission> => {
    const response = await axiosInstance.get(`/v1/books/${bookId}/review-permission`, {
      params: { user_id: userId },
    });
    return response.data;
  },

  submitReview: async (bookId: number, data: ISubmitReviewParams): Promise<{ message: string }> => {
    const response = await axiosInstance.post(`/v1/books/${bookId}/reviews`, data);
    return response.data;
  },
};
