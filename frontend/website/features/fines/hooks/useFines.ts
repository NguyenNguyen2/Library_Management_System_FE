import { useQuery } from '@tanstack/react-query';
import { fineApi, type IFinesResponse } from '../api/fineApi';

export const useFines = () => {
  return useQuery<IFinesResponse>({
    queryKey: ['my-fines'],
    queryFn: () => fineApi.getFines(),
    staleTime: 60_000,
  });
};
