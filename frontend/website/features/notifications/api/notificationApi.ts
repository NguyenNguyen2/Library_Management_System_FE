import axiosInstance from '@/lib/axios/axios-client';

export interface INotification {
  notification_id: number;
  title: string;
  content: string;
  type: string;
  is_read: 0 | 1;
  created_at: string;
}

export interface INotificationsResponse {
  data: INotification[];
  unread_count: number;
}

export const notificationApi = {
  getMyNotifications: async (): Promise<INotificationsResponse> => {
    const response = await axiosInstance.get('/v1/me/notifications');
    return response.data;
  },

  markRead: async (id: number): Promise<{ message: string }> => {
    const response = await axiosInstance.patch(`/v1/me/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async (): Promise<{ message: string }> => {
    const response = await axiosInstance.patch('/v1/me/notifications/read-all');
    return response.data;
  },
};
