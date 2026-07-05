'use client'

import { useMemo } from 'react';
import { App, Button, Spin, Tag } from 'antd';
import { BellOutlined, CheckCircleOutlined, CheckOutlined } from '@ant-design/icons';
import { APP_ROUTE } from '@/constants/routes';
import { useRouter } from 'next/navigation';
import { useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useNotifications } from '@/features/private/hooks/useNotifications';
import { formatDateVN } from '@/lib/utils/date';

export function NotificationsPage() {
  const router = useRouter();
  const { message } = App.useApp();

  const { data, isLoading, error } = useNotifications();
  const notifications = Array.isArray(data) ? data : [];
  const markAsRead = useMarkNotificationAsRead();
  const markAll = useMarkAllNotificationsAsRead();

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.is_read),
    [notifications]
  );

  const onMarkAsRead = (id: number) => {
    markAsRead.mutate(id, {
      onSuccess: () => message.success('Đã đánh dấu thông báo là đã đọc.'),
      onError: () => message.error('Không thể đánh dấu thông báo đã đọc. Vui lòng thử lại.'),
    });
  };

  const onMarkAllAsRead = () => {
    if (unreadNotifications.length === 0) return;

    markAll.mutate(
      unreadNotifications.map((item) => item.notification_id),
      {
        onSuccess: () => message.success('Đã đánh dấu tất cả thông báo là đã đọc.'),
        onError: () => message.error('Không thể đánh dấu tất cả thông báo. Vui lòng thử lại.'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-700 text-base">Không thể tải thông báo. Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Thông báo</h1>
          <p className="mt-1 text-sm text-gray-500">
            Danh sách thông báo mới nhất từ hệ thống.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BellOutlined />
            <span>{notifications.length} thông báo</span>
            <Tag color={unreadNotifications.length > 0 ? 'processing' : 'default'}>
              {unreadNotifications.length} chưa đọc
            </Tag>
          </div>
          <Button
            type="default"
            icon={<CheckOutlined />}
            onClick={onMarkAllAsRead}
            loading={markAll.isPending}
            disabled={unreadNotifications.length === 0}
          >
            Đánh dấu tất cả
          </Button>
          <Button
            type="default"
            icon={<BellOutlined />}
            onClick={() => router.push(APP_ROUTE.home)}
          >
            Về trang chủ
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-500 text-base">Bạn chưa có thông báo nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const isRead = !!notification.is_read;
            return (
              <article
                key={notification.notification_id}
                className={`rounded-3xl border p-6 transition-shadow ${
                  isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200 shadow-sm'
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">{notification.title}</h2>
                      {!isRead && (
                        <Tag color="blue" className="text-xs font-semibold uppercase">
                          mới
                        </Tag>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{formatDateVN(notification.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="small"
                      type={isRead ? 'default' : 'primary'}
                      icon={isRead ? <CheckCircleOutlined /> : <BellOutlined />}
                      onClick={() => onMarkAsRead(notification.notification_id)}
                      loading={markAsRead.isPending && markAsRead.variables === notification.notification_id}
                      disabled={isRead}
                    >
                      {isRead ? 'Đã đọc' : 'Đánh dấu đã đọc'}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 text-gray-800 whitespace-pre-line">{notification.content}</div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
