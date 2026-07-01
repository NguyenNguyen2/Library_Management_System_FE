import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import {
  bookApi,
  IBookSearchResult, IBookSearchParams, IBookFilterOptions, IBookDetail,
  IRelatedBooks, IHomeBooks,
  IReviewResponse, IReviewPermission, ISubmitReviewParams,
} from '../api/bookApi';

export const useSearchBooks = (params: IBookSearchParams) => {
  return useQuery<IBookSearchResult[]>({
    queryKey: ['books-search', params],
    queryFn: () => bookApi.search(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
};

export const useBookFilterOptions = () => {
  return useQuery<IBookFilterOptions>({
    queryKey: ['books-filter-options'],
    queryFn: () => bookApi.filterOptions(),
    staleTime: 5 * 60_000,
  });
};

export const useBookDetail = (bookId: number) => {
  return useQuery<IBookDetail>({
    queryKey: ['book-detail', bookId],
    queryFn: () => bookApi.getDetail(bookId),
    enabled: !!bookId && !isNaN(bookId),
    staleTime: 60_000,
  });
};

export const useRelatedBooks = (bookId: number) => {
  return useQuery<IRelatedBooks>({
    queryKey: ['book-related', bookId],
    queryFn: () => bookApi.getRelated(bookId),
    enabled: !!bookId && !isNaN(bookId),
    staleTime: 60_000,
  });
};

export const useHomeBooks = () => {
  return useQuery<IHomeBooks>({
    queryKey: ['books-home'],
    queryFn: () => bookApi.getHome(),
    staleTime: 2 * 60_000,
  });
};

export const useBookReviews = (bookId: number, page: number) => {
  return useQuery<IReviewResponse>({
    queryKey: ['book-reviews', bookId, page],
    queryFn: () => bookApi.getReviews(bookId, page),
    enabled: !!bookId && !isNaN(bookId),
    staleTime: 30_000,
  });
};

export const useReviewPermission = (bookId: number, userId: number) => {
  return useQuery<IReviewPermission>({
    queryKey: ['review-permission', bookId, userId],
    queryFn: () => bookApi.getReviewPermission(bookId, userId),
    enabled: !!bookId && !isNaN(bookId) && !!userId,
    staleTime: 5 * 60_000,
  });
};

export const useSubmitReview = () => {
  return useMutation({
    mutationFn: ({ bookId, data }: { bookId: number; data: ISubmitReviewParams }) =>
      bookApi.submitReview(bookId, data),
  });
};
