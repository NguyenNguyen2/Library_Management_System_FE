// Hook wrapper for courses
// Automatically switches between mock data and real API based on NEXT_PUBLIC_USE_MOCK_DATA env var

import * as React from 'react';
import { mockCourses, type MockCourse } from '@/lib/mock/mockData';

interface MockResponse<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function useMockCourses(params?: { page?: number; limit?: number }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  // Simulate API delay
  const [data, setData] = React.useState<MockResponse<MockCourse> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error] = React.useState(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const start = (page - 1) * limit;
      const paginatedData = mockCourses.slice(start, start + limit);
      setData({
        rows: paginatedData,
        total: mockCourses.length,
        page,
        pageSize: limit,
      });
      setIsLoading(false);
    }, 300); // Simulate network delay

    return () => clearTimeout(timer);
  }, [page, limit]);

  return { data, isLoading, error };
}
