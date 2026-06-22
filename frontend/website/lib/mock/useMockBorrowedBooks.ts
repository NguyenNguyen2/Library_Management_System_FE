// Mock hook for currently borrowed books
// Returns paginated mock data with a simulated network delay

import * as React from 'react';
import { mockBorrowedBooks, type MockBorrowedBook } from '@/lib/mock/mockData';

interface MockResponse<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function useMockBorrowedBooks(params?: { page?: number; limit?: number }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 100;

  const [data, setData] = React.useState<MockResponse<MockBorrowedBook> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const start = (page - 1) * limit;
      const paginatedData = mockBorrowedBooks.slice(start, start + limit);
      setData({
        rows: paginatedData,
        total: mockBorrowedBooks.length,
        page,
        pageSize: limit,
      });
      setIsLoading(false);
    }, 300); // Simulate network delay

    return () => clearTimeout(timer);
  }, [page, limit]);

  return { data, isLoading, error: null };
}
