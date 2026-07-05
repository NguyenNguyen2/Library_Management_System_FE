'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { App, Button, Spin } from 'antd';
import {
  BookOutlined,
  ClockCircleOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  HourglassOutlined,
  TeamOutlined,
  RightOutlined,
  StarFilled,
} from '@ant-design/icons';
import { useReservations, useCancelReservation } from '@/features/reservations/hooks/useReservations';
import { APP_ROUTE } from '@/constants/routes';
import { formatDateVN } from '@/lib/utils/date';
import { toCoverImageUrl } from '@/lib/utils/image';
import type { IReservation } from '@/features/reservations/api/reservationApi';

const STATUS_CONFIG: Record<IReservation['status'], { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  waiting: { label: 'Đang chờ', icon: <ClockCircleOutlined />, bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  ready: { label: 'Sẵn sàng lấy', icon: <BellOutlined />, bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  completed: { label: 'Đã lấy', icon: <CheckCircleOutlined />, bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  expired: { label: 'Đã hết hạn', icon: <ExclamationCircleOutlined />, bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' },
  cancelled: { label: 'Đã hủy', icon: <ExclamationCircleOutlined />, bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' },
};

const TABS = [
  { key: 'active' as const, label: 'Đang chờ', statuses: ['waiting', 'ready'] as IReservation['status'][] },
  { key: 'history' as const, label: 'Lịch sử', statuses: ['completed', 'expired', 'cancelled'] as IReservation['status'][] },
];

function estimateWait(position: number) {
  if (position <= 1) return 'Sắp đến lượt';
  const days = (position - 1) * 14;
  if (days < 30) return `~${days} ngày`;
  return `~${Math.round(days / 30)} tháng`;
}

export default function ReservationsPage() {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const { data, isLoading } = useReservations();
  const { mutateAsync, isPending, variables: pendingId } = useCancelReservation();

  const [reservations, setReservations] = useState<IReservation[] | null>(null);
  const [tab, setTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    if (data?.data) setReservations(data.data);
  }, [data]);

  if (isLoading || !reservations) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  const activeList = reservations.filter((r) => r.status === 'waiting' || r.status === 'ready');
  const historyList = reservations.filter((r) => r.status === 'completed' || r.status === 'expired' || r.status === 'cancelled');
  const displayed = tab === 'active' ? activeList : historyList;

  const handleCancel = (id: number, title: string) => {
    modal.confirm({
      title: 'Xác nhận hủy đặt trước',
      content: `Bạn có chắc muốn hủy đặt trước sách "${title}"?`,
      okText: 'Hủy đặt trước',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          await mutateAsync(id);
          message.success(`Đã hủy đặt trước sách "${title}"`);
        } catch {
          message.error('Hủy đặt trước thất bại. Vui lòng thử lại.');
        }
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sách đặt trước</h1>
        <p className="text-gray-500 text-sm mt-1">
          Theo dõi hàng chờ và trạng thái sách bạn đã đặt trước
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-1.5 text-amber-600 mb-1 text-xs font-medium">
            <HourglassOutlined />
            <span>Đang chờ</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeList.filter((r) => r.status === 'waiting').length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-1.5 text-green-600 mb-1 text-xs font-medium">
            <BellOutlined />
            <span>Sẵn sàng lấy</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeList.filter((r) => r.status === 'ready').length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-1.5 text-blue-600 mb-1 text-xs font-medium">
            <CheckCircleOutlined />
            <span>Đã hoàn thành</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{historyList.filter((r) => r.status === 'completed').length}</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-colors -mb-px ${
              tab === t.key ? 'border-blue-500 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
              {t.key === 'active' ? activeList.length : historyList.length}
            </span>
          </button>
        ))}
      </div>

      {/* Ready alert */}
      {tab === 'active' && activeList.some((r) => r.status === 'ready') && (
        <div className="mb-4 bg-green-50 border border-green-300 rounded-xl px-4 py-3 flex items-start gap-3">
          <ExclamationCircleOutlined className="text-green-600 mt-0.5" />
          <div className="text-sm">
            <p className="text-green-800 font-semibold">Có sách đang chờ bạn đến lấy!</p>
            <p className="text-green-600">Vui lòng đến mượn trước ngày hết hạn, sau đó hệ thống sẽ tự động hủy và chuyển cho người tiếp theo.</p>
          </div>
        </div>
      )}

      {/* List */}
      {displayed.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-gray-300">
            <BookOutlined />
          </div>
          <p className="text-gray-500 font-medium">
            {tab === 'active' ? 'Bạn chưa đặt trước sách nào' : 'Chưa có lịch sử đặt trước'}
          </p>
          {tab === 'active' && (
            <>
              <p className="text-sm text-gray-400 mt-1">Khi sách hết bản sao, bạn có thể đặt trước để giữ chỗ</p>
              <Button type="primary" className="mt-4 bg-blue-600" onClick={() => router.push(APP_ROUTE.courses)}>
                Tìm sách để đặt trước
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((reservation) => {
            const cfg = STATUS_CONFIG[reservation.status];
            const isCancelling = isPending && pendingId === reservation.reservation_id;

            return (
              <div
                key={reservation.reservation_id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  reservation.status === 'ready' ? 'border-green-300 ring-1 ring-green-200' : 'border-gray-200'
                }`}
              >
                {reservation.status === 'ready' && (
                  <div className="bg-green-500 px-4 py-2 flex items-center gap-2 text-white text-sm font-semibold">
                    <BellOutlined />
                    <p>
                      Sách đã sẵn sàng — vui lòng đến lấy trước{' '}
                      {reservation.expired_at ? formatDateVN(reservation.expired_at) : '2 ngày tới'}
                    </p>
                  </div>
                )}

                <div className="flex gap-4 p-4">
                  <div
                    className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer"
                    onClick={() => router.push(`${APP_ROUTE.courses}/${reservation.book_id}`)}
                  >
                    {reservation.cover_image ? (
                      <img
                        src={toCoverImageUrl(reservation.cover_image) ?? undefined}
                        alt={reservation.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-2xl text-gray-300">📖</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3
                          className="text-gray-900 font-semibold text-sm hover:text-blue-600 cursor-pointer transition-colors"
                          onClick={() => router.push(`${APP_ROUTE.courses}/${reservation.book_id}`)}
                        >
                          {reservation.title}
                        </h3>
                        {reservation.author_name && (
                          <p className="text-xs text-gray-500 mt-0.5">{reservation.author_name}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {reservation.category_name && (
                            <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">{reservation.category_name}</span>
                          )}
                          <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            {cfg.icon}
                            {cfg.label}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <StarFilled key={i} className={i <= Math.round(reservation.avg_rating ?? 0) ? 'text-yellow-400' : 'text-gray-200'} />
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {reservation.status === 'waiting' && (
                        <>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <TeamOutlined className="text-amber-500" />
                            <span>
                              Vị trí hàng chờ: <span className="text-amber-700 font-bold">#{reservation.queue_position}</span> / {reservation.total_queue}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <HourglassOutlined className="text-gray-400" />
                            <span>
                              Ước tính: <span className="font-semibold">{estimateWait(reservation.queue_position)}</span>
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <CalendarOutlined className="text-gray-400" />
                        <span>Đặt ngày: {formatDateVN(reservation.reserved_at)}</span>
                      </div>
                      {reservation.notified_at && (
                        <div className="flex items-center gap-1.5 text-xs text-green-600">
                          <BellOutlined />
                          <span>Thông báo: {formatDateVN(reservation.notified_at)}</span>
                        </div>
                      )}
                    </div>

                    {reservation.status === 'waiting' && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => router.push(`${APP_ROUTE.courses}/${reservation.book_id}`)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          Xem sách <RightOutlined className="text-[10px]" />
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleCancel(reservation.reservation_id, reservation.title)}
                          disabled={isCancelling}
                          className="text-xs text-red-500 hover:underline disabled:opacity-50"
                        >
                          {isCancelling ? 'Đang hủy...' : 'Hủy đặt trước'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
