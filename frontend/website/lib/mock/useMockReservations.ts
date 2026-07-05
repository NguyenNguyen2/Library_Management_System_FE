// Mock hook for the reader's book reservations
// Returns paginated mock data with a simulated network delay

import * as React from 'react';
import { mockReservations, type MockReservation } from '@/lib/mock/mockData';

interface MockResponse<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function useMockReservations(params?: { page?: number; limit?: number }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 100;

  const [data, setData] = React.useState<MockResponse<MockReservation> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const start = (page - 1) * limit;
      const paginatedData = mockReservations.slice(start, start + limit);
      setData({
        rows: paginatedData,
        total: mockReservations.length,
        page,
        pageSize: limit,
      });
      setIsLoading(false);
    }, 300); // Simulate network delay

    return () => clearTimeout(timer);
  }, [page, limit]);

  return { data, isLoading, error: null };
}
