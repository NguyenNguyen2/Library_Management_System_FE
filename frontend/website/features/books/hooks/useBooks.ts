import { useQuery } from '@tanstack/react-query';
import { bookApi, IBookSearchResult, IBookSearchParams, IBookFilterOptions } from '../api/bookApi';

export const useSearchBooks = (params: IBookSearchParams) => {
  return useQuery<IBookSearchResult[]>({
    queryKey: ['books-search', params],
    queryFn: () => bookApi.search(params),
    staleTime: 30_000,
  });
};

export const useBookFilterOptions = () => {
  return useQuery<IBookFilterOptions>({
    queryKey: ['books-filter-options'],
    queryFn: () => bookApi.filterOptions(),
    staleTime: 5 * 60_000,
  });
};
