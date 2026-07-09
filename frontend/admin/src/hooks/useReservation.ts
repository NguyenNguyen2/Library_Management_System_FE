import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  reservationApi,
  BookSearchResult,
  ReservationListResponse,
  CreateReservationPayload,
  CreateReservationResult,
  ConfirmReservationPayload,
  ConfirmReservationResult,
  MarkReadyResult,
} from '../api/reservationApi';

export const reservationHooks = {
  useSearchBook: () =>
    useMutation<BookSearchResult[], AxiosError, string>({
      mutationFn: reservationApi.searchBook,
    }),

  useListReservations: (params?: {
    user_id?: number;
    status?: string;
    per_page?: number;
    page?: number;
  }) =>
    useQuery<ReservationListResponse, AxiosError>({
      queryKey: ['reservations', params],
      queryFn: () => reservationApi.listReservations(params),
    }),

  useCreateReservation: () => {
    const qc = useQueryClient();
    return useMutation<CreateReservationResult, AxiosError, CreateReservationPayload>({
      mutationFn: reservationApi.createReservation,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['reservations'] });
        qc.invalidateQueries({ queryKey: ['reportTodayReport'] });
        qc.invalidateQueries({ queryKey: ['dashboard-summary'] });
      },
    });
  },

  useConfirmReservation: () => {
    const qc = useQueryClient();
    return useMutation<ConfirmReservationResult, AxiosError, ConfirmReservationPayload>({
      mutationFn: reservationApi.confirmReservation,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['reservations'] });
        qc.invalidateQueries({ queryKey: ['reportTodayReport'] });
        qc.invalidateQueries({ queryKey: ['dashboard-summary'] });
      },
    });
  },

  useMarkReady: () => {
    const qc = useQueryClient();
    return useMutation<MarkReadyResult, AxiosError, number>({
      mutationFn: reservationApi.markReady,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['reservations'] });
        qc.invalidateQueries({ queryKey: ['reportTodayReport'] });
        qc.invalidateQueries({ queryKey: ['dashboard-summary'] });
      },
    });
  },

  useCancelReservation: () => {
    const qc = useQueryClient();
    return useMutation<void, AxiosError, number>({
      mutationFn: reservationApi.cancelReservation,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['reservations'] });
        qc.invalidateQueries({ queryKey: ['reportTodayReport'] });
        qc.invalidateQueries({ queryKey: ['dashboard-summary'] });
      },
    });
  },
};
