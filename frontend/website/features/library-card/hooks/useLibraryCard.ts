import { useQuery } from '@tanstack/react-query';
import { libraryCardApi, ILibraryCard } from '../api/libraryCardApi';

export const useGetLibraryCard = (userId: string) => {
  return useQuery<ILibraryCard>({
    queryKey: ['library-card', userId],
    queryFn: () => libraryCardApi.getCard(userId),
    enabled: !!userId,
    retry: false,
  });
};
