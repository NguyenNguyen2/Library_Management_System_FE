import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { notificationApi, type INotificationsResponse } from '../api/notificationApi';
import { useUser } from '@shared/provider/UserProvider';

const POLL_INTERVAL_MS = 30_000;

export const useNotifications = () => {
  return useQuery<INotificationsResponse>({
    queryKey: ['my-notifications'],
    queryFn: () => notificationApi.getMyNotifications(),
    staleTime: 0,
    refetchInterval: POLL_INTERVAL_MS,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id: number) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, void>({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });
};

/**
 * Mounts in private layout.
 * Polls notifications every 30s. When a new notification of type
 * 'card_renewal' or 'borrow_renewal' arrives (regardless of is_read state),
 * invalidates the relevant queries so the reader sees updated data without F5.
 *
 * Tracks by notification_id (not unread_count delta) so mark-all-read between
 * poll cycles does not prevent invalidation from firing.
 */
export const useNotificationSync = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  const { data } = useQuery<INotificationsResponse>({
    queryKey: ['my-notifications-response'],
    queryFn: () => notificationApi.getMyNotifications(),
    staleTime: 0,
    refetchInterval: POLL_INTERVAL_MS,
    enabled: !!user,
  });

  useEffect(() => {
    if (!data) return;

    // First load: seed seen IDs without triggering invalidation
    if (!initialized.current) {
      data.data.forEach((n) => seenIds.current.add(String(n.notification_id)));
      initialized.current = true;
      return;
    }

    // Find notifications not yet processed, regardless of is_read state
    const unseen = data.data.filter((n) => !seenIds.current.has(String(n.notification_id)));

    if (unseen.length > 0) {
      const hasCardRenewal = unseen.some((n) => n.type === 'card_renewal');
      const hasBorrowRenewal = unseen.some((n) => n.type === 'borrow_renewal');

      if (hasCardRenewal && user?.id) {
        queryClient.invalidateQueries({ queryKey: ['library-card', String(user.id)] });
        queryClient.invalidateQueries({ queryKey: ['my-card-renewal-requests'] });
      }
      if (hasBorrowRenewal) {
        queryClient.invalidateQueries({ queryKey: ['my-borrowing'] });
      }

      unseen.forEach((n) => seenIds.current.add(String(n.notification_id)));
    }
  }, [data, queryClient, user]);
};
