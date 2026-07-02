import axiosInstance from '@/lib/axios/axios-client';

export interface INotification {
  notification_id: number;
  title: string;
  content: string;
  is_read: 0 | 1 | boolean;
  created_at: string;
}

export const notificationApi = {
  getNotifications: async (): Promise<INotification[]> => {
    const response = await axiosInstance.get('/v1/me/notifications');
    return response.data?.results?.objects ?? [];
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    await axiosInstance.patch(`/v1/me/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (notificationIds: number[]): Promise<void> => {
    await Promise.all(
      notificationIds.map((id) =>
        axiosInstance.patch(`/v1/me/notifications/${id}/read`)
      )
    );
  },
};
