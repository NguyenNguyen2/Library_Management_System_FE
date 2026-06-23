import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationApi, type IReservationsResponse } from '../api/reservationApi';

export const useReservations = () => {
  return useQuery<IReservationsResponse>({
    queryKey: ['my-reservations'],
    queryFn: () => reservationApi.getMyReservations(),
    staleTime: 60_000,
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (reservationId: number) => reservationApi.cancelReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
    },
  });
};
