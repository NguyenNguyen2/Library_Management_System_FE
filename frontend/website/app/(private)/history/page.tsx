'use client';

import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useBorrowHistory } from '@/features/borrowing/hooks/useBorrowing';
import { APP_ROUTE } from '@/constants/routes';
import { formatDateVN } from '@/lib/utils/date';
import { toCoverImageUrl } from '@/lib/utils/image';
import type { IBorrowHistory } from '@/features/borrowing/api/borrowingApi';

const STATUS_BADGE: Record<'on_time' | 'late', { label: string; className: string; icon: React.ReactNode }> = {
  on_time: {
    label: 'Đúng hạn',
    className: 'bg-green-100 text-green-700 border border-green-200',
    icon: <CheckCircleOutlined />,
  },
  late: {
    label: 'Trễ hạn',
    className: 'bg-red-100 text-red-700 border border-red-200',
    icon: <WarningOutlined />,
  },
};

function HistoryCard({ record }: { record: IBorrowHistory }) {
  const router = useRouter();
  const badge = STATUS_BADGE[record.return_status.value];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex gap-5">
        <div
          className="w-20 h-28 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 cursor-pointer"
          onClick={() => router.push(`${APP_ROUTE.courses}/${record.book_id}`)}
        >
          {record.cover_image ? (
            <img src={toCoverImageUrl(record.cover_image) ?? undefined} alt={record.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
          ) : (
            <span className="text-3xl text-gray-300">📖</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3
              className="text-base font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors leading-snug"
              onClick={() => router.push(`${APP_ROUTE.courses}/${record.book_id}`)}
            >
              {record.title}
            </h3>
            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${badge.className}`}>
              {badge.icon}
              {badge.label}
              {record.return_status.value === 'late' && (
                <span className="ml-0.5">({record.days_late} ngày)</span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <CalendarOutlined /> Ngày mượn
              </p>
              <p className="font-medium text-gray-900 mt-0.5">{formatDateVN(record.borrow_date)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Hạn trả</p>
              <p className="font-medium text-gray-900 mt-0.5">{formatDateVN(record.due_date)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Ngày trả thực tế</p>
              <p className={`font-medium mt-0.5 ${record.return_status.value === 'late' ? 'text-red-600' : 'text-gray-900'}`}>
                {formatDateVN(record.return_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <ReloadOutlined /> Số lần gia hạn
              </p>
              <p className="font-medium text-gray-900 mt-0.5">{record.renew_count}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { data, isLoading } = useBorrowHistory();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  const history = data?.data ?? [];
  const onTimeCount = history.filter((t) => t.return_status.value === 'on_time').length;
  const lateCount   = history.filter((t) => t.return_status.value === 'late').length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử mượn trả</h1>
        <p className="text-gray-500 mt-1 text-sm">Xem lại tất cả các giao dịch mượn sách của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500 mb-1">Tổng sách đã trả</p>
          <p className="text-3xl font-bold text-gray-900">{history.length}</p>
        </div>
        <div className="bg-white border border-green-200 rounded-xl p-4">
          <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
            <CheckCircleOutlined className="text-green-500" /> Đúng hạn
          </p>
          <p className="text-3xl font-bold text-green-600">{onTimeCount}</p>
        </div>
        <div className="bg-white border border-red-200 rounded-xl p-4">
          <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5">
            <WarningOutlined className="text-red-500" /> Trễ hạn
          </p>
          <p className="text-3xl font-bold text-red-600">{lateCount}</p>
        </div>
      </div>

      {/* List */}
      {history.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <BookOutlined className="text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Bạn chưa có lịch sử mượn sách</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record) => (
            <HistoryCard key={`${record.borrow_id}-${record.copy_id}`} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
