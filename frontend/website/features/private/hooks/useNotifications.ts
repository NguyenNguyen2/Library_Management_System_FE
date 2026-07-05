import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi, type INotification } from '../api/notificationApi';

export const useNotifications = () => {
  return useQuery<INotification[]>({
    queryKey: ['my-notifications'],
    queryFn: () => notificationApi.getNotifications(),
    staleTime: 60_000,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number[]>({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });
};
